import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import OpenAI from 'openai';
import { QdrantClient } from '@qdrant/js-client-rest';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require('pdf-parse');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const mammoth = require('mammoth');

import {
  IngestionDocument,
  IngestionDocumentDocument,
} from './schemas/document.schema';

const CHUNK_SIZE = 500; // characters per chunk
const CHUNK_OVERLAP = 80;

@Injectable()
export class IngestionService implements OnModuleInit {
  private readonly logger = new Logger(IngestionService.name);
  private readonly openai: OpenAI;
  private readonly qdrant: QdrantClient;
  private readonly collectionName: string;

  constructor(
    @InjectModel(IngestionDocument.name)
    private readonly docModel: Model<IngestionDocumentDocument>,
    private readonly configService: ConfigService,
  ) {
    const geminiKey = this.configService.get<string>('GEMINI_API_KEY');
    this.openai = new OpenAI({
      apiKey: geminiKey || this.configService.get<string>('OPENAI_API_KEY'),
      baseURL: geminiKey ? 'https://generativelanguage.googleapis.com/v1beta/openai/' : undefined,
    });
    this.qdrant = new QdrantClient({
      url: this.configService.get<string>('QDRANT_URL', 'http://localhost:6333'),
    });
    this.collectionName = this.configService.get<string>(
      'QDRANT_COLLECTION',
      'knowledge_chunks',
    );
  }

  // Ensure Qdrant collection exists on startup
  async onModuleInit() {
    try {
      const collections = await this.qdrant.getCollections();
      const exists = collections.collections.some(
        (c) => c.name === this.collectionName,
      );
      if (!exists) {
        const vectorSize = this.configService.get<string>('GEMINI_API_KEY') ? 3072 : 1536;
        await this.qdrant.createCollection(this.collectionName, {
          vectors: { size: vectorSize, distance: 'Cosine' },
        });
        this.logger.log(`Created Qdrant collection: ${this.collectionName}`);
      }
    } catch (err) {
      this.logger.warn(`Could not init Qdrant collection: ${err.message}`);
    }
  }

  // ─── Upload & Process ─────────────────────────────────────────────────────────

  async uploadDocument(
    file: Express.Multer.File,
    lessonId: string | undefined,
    uploadedBy: string,
  ) {
    // Create document record
    const doc = await this.docModel.create({
      filename: file.filename ?? file.originalname,
      originalName: file.originalname,
      status: 'PENDING',
      lesson_id: lessonId ?? null,
      uploaded_by: uploadedBy,
      chunk_count: 0,
    });

    // Process in background (fire & forget)
    this.processDocument(doc.id as string, file).catch((err) => {
      this.logger.error(`Background processing failed for ${doc.id}: ${err.message}`);
    });

    return {
      documentId: doc.id,
      status: 'PENDING',
      message: 'Document đang được xử lý',
    };
  }

  async getDocuments(uploadedBy: string) {
    return this.docModel
      .find({ uploaded_by: uploadedBy })
      .sort({ created_at: -1 })
      .lean()
      .exec();
  }

  // ─── Processing Pipeline ──────────────────────────────────────────────────────

  private async processDocument(docId: string, file: Express.Multer.File) {
    await this.docModel.findByIdAndUpdate(docId, { status: 'PROCESSING' });

    try {
      // 1. Parse text from file
      const text = await this.extractText(file);

      // 2. Chunk text
      const chunks = this.chunkText(text);
      this.logger.log(`Document ${docId}: ${chunks.length} chunks created`);

      // 3. Embed + upsert to Qdrant
      const doc = await this.docModel.findById(docId).lean();
      await this.embedAndUpsert(chunks, docId, doc?.lesson_id ?? null);

      // 4. Update status
      await this.docModel.findByIdAndUpdate(docId, {
        status: 'DONE',
        chunk_count: chunks.length,
      });

      this.logger.log(`Document ${docId} processed successfully`);
    } catch (err) {
      await this.docModel.findByIdAndUpdate(docId, {
        status: 'ERROR',
        error_message: err.message,
      });
      throw err;
    } finally {
      // Clean up temp file if on disk
      if (file.path && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    }
  }

  private async extractText(file: Express.Multer.File): Promise<string> {
    const ext = path.extname(file.originalname).toLowerCase();
    const buffer = file.buffer ?? fs.readFileSync(file.path);

    if (ext === '.pdf') {
      const data = await pdfParse(buffer);
      return data.text;
    }

    if (ext === '.docx' || ext === '.doc') {
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    }

    if (ext === '.txt' || ext === '.md') {
      return buffer.toString('utf-8');
    }

    throw new Error(`Định dạng file không hỗ trợ: ${ext}`);
  }

  private chunkText(text: string): string[] {
    const cleaned = text.replace(/\s+/g, ' ').trim();
    const chunks: string[] = [];
    let start = 0;

    while (start < cleaned.length) {
      const end = Math.min(start + CHUNK_SIZE, cleaned.length);
      chunks.push(cleaned.slice(start, end).trim());
      start += CHUNK_SIZE - CHUNK_OVERLAP;
    }

    return chunks.filter((c) => c.length > 20);
  }

  private async embedAndUpsert(
    chunks: string[],
    documentId: string,
    lessonId: string | null,
  ) {
    const BATCH = 20;

    for (let i = 0; i < chunks.length; i += BATCH) {
      const batch = chunks.slice(i, i + BATCH);

      // Embed batch
      const embeddingResp = await this.openai.embeddings.create({
        model: this.configService.get<string>('GEMINI_API_KEY') ? 'gemini-embedding-001' : 'text-embedding-3-small',
        input: batch,
      });

      // Build Qdrant points
      const points = embeddingResp.data.map((emb, idx) => ({
        id: uuidv4(),
        vector: emb.embedding,
        payload: {
          document_id: documentId,
          lesson_id: lessonId ?? '',
          chunk_text: batch[idx],
          topic: '',
          level: '',
        },
      }));

      await this.qdrant.upsert(this.collectionName, { points, wait: true });
    }
  }
}
