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
  private readonly geminiKeys: string[];
  private currentKeyIndex = 0;

  constructor(
    @InjectModel(IngestionDocument.name)
    private readonly docModel: Model<IngestionDocumentDocument>,
    private readonly configService: ConfigService,
  ) {
    const keysStr = this.configService.get<string>('GEMINI_API_KEYS') || '';
    const singleKey = this.configService.get<string>('GEMINI_API_KEY') || '';
    const parsed = keysStr.split(',').map(k => k.trim()).filter(Boolean);
    this.geminiKeys = parsed.length > 0 ? parsed : (singleKey ? [singleKey] : []);

    const geminiKey = this.geminiKeys[0] || undefined;
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
        const hasGemini = this.geminiKeys.length > 0;
        const vectorSize = hasGemini ? 3072 : 1536;
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
    topic?: string,
    level?: string,
  ) {
    // Create document record
    const doc = await this.docModel.create({
      filename: file.filename ?? file.originalname,
      originalName: file.originalname,
      status: 'PENDING',
      lesson_id: lessonId ?? null,
      uploaded_by: uploadedBy,
      chunk_count: 0,
      topic: topic ?? null,
      level: level ?? null,
    });

    // Process in background (fire & forget)
    this.processDocument(doc.id as string, file, topic, level).catch((err) => {
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

  private async processDocument(
    docId: string,
    file: Express.Multer.File,
    topic?: string,
    level?: string,
  ) {
    await this.docModel.findByIdAndUpdate(docId, { status: 'PROCESSING' });

    try {
      // 1. Parse text from file
      const text = await this.extractText(file);

      // 2. Chunk text
      const chunks = this.chunkText(text);
      this.logger.log(`Document ${docId}: ${chunks.length} chunks created`);

      // 3. Embed + upsert to Qdrant
      const doc = await this.docModel.findById(docId).lean();
      await this.embedAndUpsert(chunks, docId, doc?.lesson_id ?? null, topic, level);

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
    topic?: string,
    level?: string,
  ) {
    const BATCH = 20;

    for (let i = 0; i < chunks.length; i += BATCH) {
      const batch = chunks.slice(i, i + BATCH);

      // Embed batch with rotation
      const embeddings = await this.embedBatch(batch);

      // Build Qdrant points
      const points = embeddings.map((emb, idx) => ({
        id: uuidv4(),
        vector: emb,
        payload: {
          document_id: documentId,
          lesson_id: lessonId ?? '',
          chunk_text: batch[idx],
          topic: topic ?? '',
          level: level ?? '',
        },
      }));

      await this.qdrant.upsert(this.collectionName, { points, wait: true });
    }
  }

  // ─── Vector Search ────────────────────────────────────────────────────────────

  async search(query: string, limit = 5) {
    try {
      const embedding = await this.embedText(query);

      const results = await this.qdrant.search(this.collectionName, {
        vector: embedding,
        limit,
        with_payload: true,
      });

      return results.map((r) => ({
        id: r.id,
        score: r.score,
        text: String(r.payload?.chunk_text ?? ''),
        topic: String(r.payload?.topic ?? ''),
        level: String(r.payload?.level ?? ''),
      }));
    } catch (err) {
      this.logger.error(`Failed to search in Qdrant: ${err.message}`);
      return [];
    }
  }

  private async embedText(text: string): Promise<number[]> {
    const res = await this.embedBatch([text]);
    return res[0];
  }

  private async embedBatch(inputs: string[]): Promise<number[][]> {
    const openAiKey = this.configService.get<string>('OPENAI_API_KEY') || '';
    const useOpenAI = openAiKey && !openAiKey.includes('your-openai') && openAiKey !== 'sk-...';

    if (this.geminiKeys.length === 0 && !useOpenAI) {
      const vectorSize = 3072;
      return inputs.map(() => Array(vectorSize).fill(0.1));
    }

    if (useOpenAI && this.geminiKeys.length === 0) {
      const client = new OpenAI({ apiKey: openAiKey });
      const response = await client.embeddings.create({
        model: 'text-embedding-3-small',
        input: inputs,
      });
      return response.data.map(d => d.embedding);
    }

    const totalKeys = this.geminiKeys.length;
    let lastError: any;

    for (let attempt = 0; attempt < totalKeys; attempt++) {
      const keyIdx = (this.currentKeyIndex + attempt) % totalKeys;
      const key = this.geminiKeys[keyIdx];
      try {
        const client = new OpenAI({
          apiKey: key,
          baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
        });
        const response = await client.embeddings.create({
          model: 'gemini-embedding-001',
          input: inputs,
        });
        this.currentKeyIndex = keyIdx;
        return response.data.map(d => d.embedding);
      } catch (err: any) {
        this.logger.warn(`Embedding batch failed with key #${keyIdx + 1}: ${err.message}`);
        lastError = err;
        if (err.status === 429 || err.status === 503) {
          continue;
        }
      }
    }
    throw lastError || new Error('Tất cả API keys để tạo embedding đều thất bại');
  }
}
