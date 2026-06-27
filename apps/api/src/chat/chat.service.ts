import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Model, Types } from 'mongoose';
import OpenAI from 'openai';
import { QdrantClient } from '@qdrant/js-client-rest';

import { ChatSession, ChatSessionDocument } from './schemas/chat-session.schema';
import { ChatMessage, ChatMessageDocument, RetrievedSource } from './schemas/chat-message.schema';
import { SendMessageDto } from './dto/send-message.dto';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);
  private readonly qdrant: QdrantClient;
  private readonly collectionName: string;
  private readonly geminiKeys: string[];
  private currentKeyIndex = 0;

  constructor(
    @InjectModel(ChatSession.name) private sessionModel: Model<ChatSessionDocument>,
    @InjectModel(ChatMessage.name) private messageModel: Model<ChatMessageDocument>,
    private readonly configService: ConfigService,
  ) {
    const keysStr = this.configService.get<string>('GEMINI_API_KEYS') || '';
    const singleKey = this.configService.get<string>('GEMINI_API_KEY') || '';
    const parsed = keysStr.split(',').map(k => k.trim()).filter(Boolean);
    this.geminiKeys = parsed.length > 0 ? parsed : (singleKey ? [singleKey] : []);

    this.qdrant = new QdrantClient({
      url: this.configService.get<string>('QDRANT_URL', 'http://localhost:6333'),
    });

    this.collectionName = this.configService.get<string>('QDRANT_COLLECTION', 'knowledge_chunks');
  }

  // ─── Send Message (Main RAG flow) ────────────────────────────────────────────

  async sendMessage(userId: string, dto: SendMessageDto) {
    const startTime = performance.now();
    let sessionSetupMs = 0;
    let dbSaveUserMsgMs = 0;
    let dbRetrieveHistoryMs = 0;
    let embeddingMs = 0;
    let vectorSearchMs = 0;
    let llmCallMs = 0;
    let dbSaveReplyMs = 0;

    try {
      // 1. Tạo hoặc tìm session
      const t0 = performance.now();
      const session = await this.getOrCreateSession(userId, dto.sessionId, dto.lessonId);
      sessionSetupMs = performance.now() - t0;

      // 2. Lưu user message
      const t1 = performance.now();
      await this.messageModel.create({
        session_id: session._id,
        role: 'USER',
        content: dto.message,
        retrieved_sources: [],
      });
      dbSaveUserMsgMs = performance.now() - t1;

      // 3. Lấy lịch sử hội thoại gần nhất (context window)
      const t2 = performance.now();
      const recentMessages = await this.messageModel
        .find({ session_id: session._id })
        .sort({ created_at: -1 })
        .limit(10)
        .lean()
        .exec();
      const conversationHistory = recentMessages.reverse();
      dbRetrieveHistoryMs = performance.now() - t2;

      // 4. Embed query & tìm kiếm Qdrant
      let retrievedSources: RetrievedSource[] = [];
      let contextText = '';

      try {
        const t3 = performance.now();
        const embedding = await this.embedText(dto.message);
        embeddingMs = performance.now() - t3;

        const t4 = performance.now();
        const searchFilter = dto.lessonId
          ? { must: [{ key: 'lesson_id', match: { value: dto.lessonId } }] }
          : undefined;

        const searchResults = await this.qdrant.search(this.collectionName, {
          vector: embedding,
          limit: 5,
          score_threshold: 0.5,
          filter: searchFilter,
          with_payload: true,
        });

        retrievedSources = searchResults.map((r) => ({
          chunk_text: String(r.payload?.chunk_text ?? ''),
          score: r.score,
          source_id: String(r.payload?.document_id ?? r.id),
          topic: String(r.payload?.topic ?? ''),
          level: String(r.payload?.level ?? ''),
        }));

        contextText = retrievedSources
          .map((s, i) => `[${i + 1}] ${s.chunk_text}`)
          .join('\n\n');
        vectorSearchMs = performance.now() - t4;
      } catch (err: any) {
        this.logger.warn(`Qdrant search failed, answering without context: ${err?.message}`);
      }

      // 5. Gọi OpenAI Chat API với context hội thoại
      const t5 = performance.now();
      const systemPrompt = this.buildSystemPrompt(contextText);
      const reply = await this.callOpenAI(systemPrompt, conversationHistory);
      llmCallMs = performance.now() - t5;

      // 6. Lưu AI reply
      const t6 = performance.now();
      await this.messageModel.create({
        session_id: session._id,
        role: 'ASSISTANT',
        content: reply,
        retrieved_sources: retrievedSources,
      });
      dbSaveReplyMs = performance.now() - t6;

      // 7. Cập nhật session title
      const msgCount = await this.messageModel.countDocuments({ session_id: session._id });
      if (msgCount <= 2) {
        await this.sessionModel.findByIdAndUpdate(session._id, {
          title: dto.message.slice(0, 60),
        });
      }

      const totalMs = performance.now() - startTime;

      this.logger.log(`Chatbot latency details: Setup=${Math.round(sessionSetupMs)}ms, SaveUser=${Math.round(dbSaveUserMsgMs)}ms, GetHist=${Math.round(dbRetrieveHistoryMs)}ms, Embed=${Math.round(embeddingMs)}ms, QdrantSearch=${Math.round(vectorSearchMs)}ms, LLM=${Math.round(llmCallMs)}ms, SaveAI=${Math.round(dbSaveReplyMs)}ms. Total=${Math.round(totalMs)}ms`);

      return {
        sessionId: String(session._id),
        reply,
        sources: retrievedSources,
        timings: {
          sessionSetupMs: Math.round(sessionSetupMs),
          dbSaveUserMsgMs: Math.round(dbSaveUserMsgMs),
          dbRetrieveHistoryMs: Math.round(dbRetrieveHistoryMs),
          embeddingMs: Math.round(embeddingMs),
          vectorSearchMs: Math.round(vectorSearchMs),
          llmCallMs: Math.round(llmCallMs),
          dbSaveReplyMs: Math.round(dbSaveReplyMs),
          totalMs: Math.round(totalMs),
        }
      };
    } catch (error: any) {
      this.logger.error('Failed to send message', error);
      const totalMs = performance.now() - startTime;
      return {
        sessionId: dto.sessionId || 'error',
        reply: `⚠️ Exception: ${error?.message || JSON.stringify(error)}`,
        sources: [],
        timings: {
          sessionSetupMs: Math.round(sessionSetupMs),
          dbSaveUserMsgMs: Math.round(dbSaveUserMsgMs),
          dbRetrieveHistoryMs: Math.round(dbRetrieveHistoryMs),
          embeddingMs: Math.round(embeddingMs),
          vectorSearchMs: Math.round(vectorSearchMs),
          llmCallMs: Math.round(llmCallMs),
          dbSaveReplyMs: Math.round(dbSaveReplyMs),
          totalMs: Math.round(totalMs),
        }
      };
    }
  }

  // ─── Delete Session ──────────────────────────────────────────────────────────

  async deleteSession(sessionId: string, userId: string): Promise<boolean> {
    const session = await this.sessionModel.findOne({
      _id: new Types.ObjectId(sessionId),
      user_id: userId,
    });
    if (!session) return false;

    await this.messageModel.deleteMany({ session_id: session._id });
    await this.sessionModel.deleteOne({ _id: session._id });
    return true;
  }

  // ─── Session Management ───────────────────────────────────────────────────────

  async getSessions(userId: string) {
    return this.sessionModel
      .find({ user_id: userId })
      .sort({ updated_at: -1 })
      .limit(50)
      .lean()
      .exec();
  }

  async getSessionMessages(sessionId: string, userId: string) {
    const session = await this.sessionModel.findOne({
      _id: new Types.ObjectId(sessionId),
      user_id: userId,
    });

    if (!session) return [];

    return this.messageModel
      .find({ session_id: new Types.ObjectId(sessionId) })
      .sort({ created_at: 1 })
      .lean()
      .exec();
  }

  // ─── Admin Methods ────────────────────────────────────────────────────────────

  async getAllSessions(page: number = 1, limit: number = 50) {
    const sessions = await this.sessionModel
      .find()
      .sort({ updated_at: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()
      .exec();

    return sessions;
  }

  async getAdminSessionMessages(sessionId: string) {
    return this.messageModel
      .find({ session_id: new Types.ObjectId(sessionId) })
      .sort({ created_at: 1 })
      .lean()
      .exec();
  }

  async deleteSessionByAdmin(sessionId: string): Promise<boolean> {
    const session = await this.sessionModel.findById(new Types.ObjectId(sessionId));
    if (!session) return false;
    await this.messageModel.deleteMany({ session_id: session._id });
    await this.sessionModel.deleteOne({ _id: session._id });
    return true;
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────────

  private async getOrCreateSession(
    userId: string,
    sessionId?: string,
    lessonId?: string,
  ): Promise<ChatSessionDocument> {
    if (sessionId) {
      const existing = await this.sessionModel.findOne({
        _id: new Types.ObjectId(sessionId),
        user_id: userId,
      });
      if (existing) return existing;
    }

    return this.sessionModel.create({
      user_id: userId,
      lesson_id: lessonId ?? null,
      title: 'New Chat',
    });
  }

  private async embedText(text: string): Promise<number[]> {
    const mockMode = this.configService.get<string>('AI_MOCK_MODE') === 'true';
    if (mockMode) {
      return Array(3072).fill(0.1);
    }

    const openAiKey = this.configService.get<string>('OPENAI_API_KEY') || '';
    const useOpenAI = openAiKey && !openAiKey.includes('your-openai') && openAiKey !== 'sk-...';

    if (this.geminiKeys.length === 0 && !useOpenAI) {
      return Array(3072).fill(0.1);
    }

    if (useOpenAI && this.geminiKeys.length === 0) {
      const client = new OpenAI({ apiKey: openAiKey });
      const response = await client.embeddings.create({
        model: 'text-embedding-3-small',
        input: text,
      });
      return response.data[0].embedding;
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
          input: text,
        });
        this.currentKeyIndex = keyIdx;
        return response.data[0].embedding;
      } catch (err: any) {
        this.logger.warn(`Embedding failed with key #${keyIdx + 1}: ${err.message}`);
        lastError = err;
        if (err.status === 429 || err.status === 503) {
          continue;
        }
      }
    }
    throw lastError || new Error('Tất cả API keys để tạo embedding đều thất bại');
  }

  private buildSystemPrompt(context: string): string {
    const basePrompt = `Bạn là AI Trợ giảng của hệ thống E-Learning học tiếng Anh.
Tuyệt đối tuân thủ các quy tắc sau:
1. CHỈ trả lời các chủ đề liên quan đến việc học tiếng Anh. Từ chối lịch sự nếu được hỏi về chủ đề ngoài lề.
2. Trả lời NGẮN GỌN, đi thẳng vào vấn đề chính, đủ ý nhưng KHÔNG được quá dài. Chỉ giải thích thêm chi tiết nếu người dùng có yêu cầu rõ ràng.
3. Nếu đó là câu hỏi trắc nghiệm/bài tập, hãy trả lời cực kỳ ngắn gọn theo format: 1 câu đáp án, 1 câu giải thích.
4. Trả lời bằng tiếng Việt, rõ ràng, thân thiện. Sử dụng markdown để format.`;

    if (!context) return basePrompt;

    return `${basePrompt}

Dưới đây là tài liệu bài học liên quan:
---
${context}
---
Hãy ưu tiên dùng thông tin từ tài liệu trên để trả lời câu hỏi tiếng Anh một cách ngắn gọn nhất.`;
  }

  private async callOpenAI(
    systemPrompt: string,
    conversationHistory: any[],
  ): Promise<string> {
    const openAiKey = this.configService.get<string>('OPENAI_API_KEY') || '';
    const useOpenAI = openAiKey && !openAiKey.includes('your-openai') && openAiKey !== 'sk-...';

    const isMock = (this.geminiKeys.length === 0 && !useOpenAI) || this.configService.get<string>('AI_MOCK_MODE') === 'true';
    if (isMock) {
      await new Promise(r => setTimeout(r, 1500));
      const lastContent = conversationHistory.length > 0 ? conversationHistory[conversationHistory.length - 1].content : "Xin chào";
      return `Xin chào! Đây là phản hồi **mô phỏng (Mock)** do hệ thống phát hiện khóa \`OPENAI_API_KEY\` đang trỏ vào giá trị mặc định.\n\nBạn vừa nhắn: _"${lastContent}"_\n\n### Minh họa tính năng hiển thị Markdown hỗ trợ:\n\n**Thì Hiện Tại Đơn (Present Simple)** dùng để mô tả một thói quen, chân lý hoặc một sự thật hiển nhiên.\n\n| Thể | Công thức cơ bản |\n| :--- | :--- |\n| **Khẳng định** | \`S + V(s/es)\` |\n| **Phủ định** | \`S + do/does + not + V(nguyên)\` |\n| **Nghi vấn** | \`Do/Does + S + V(nguyên)?\` |\n\nHệ thống cũng tự động trích xuất các **"Nguồn tham khảo"** từ trong bài học vào cuối câu!`;
    }

    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: systemPrompt },
    ];

    for (const msg of conversationHistory) {
      messages.push({
        role: msg.role === 'USER' ? 'user' : 'assistant',
        content: msg.content,
      });
    }

    if (useOpenAI && this.geminiKeys.length === 0) {
      const client = new OpenAI({ apiKey: openAiKey });
      const completion = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages,
        max_tokens: 1500,
        temperature: 0.7,
      });
      return completion.choices[0]?.message?.content ?? 'Xin lỗi, mình không thể trả lời lúc này.';
    }

    const totalKeys = this.geminiKeys.length;
    let lastError: any;

    for (let attempt = 0; attempt < totalKeys; attempt++) {
      const keyIdx = (this.currentKeyIndex + attempt) % totalKeys;
      const key = this.geminiKeys[keyIdx];
      try {
        this.logger.log(`Calling Gemini OpenAI interface with Key #${keyIdx + 1}/${totalKeys}`);
        const client = new OpenAI({
          apiKey: key,
          baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
        });
        const completion = await client.chat.completions.create({
          model: 'gemini-2.5-flash',
          messages,
          max_tokens: 1500,
          temperature: 0.7,
        });
        this.currentKeyIndex = keyIdx;
        return completion.choices[0]?.message?.content ?? '';
      } catch (err: any) {
        this.logger.warn(`Key #${keyIdx + 1} failed: ${err.message}`);
        lastError = err;
        if (err.status === 429 || err.status === 503) {
          continue;
        }
      }
    }
    throw lastError || new Error('Tất cả API keys để sinh câu trả lời đều thất bại');
  }
}
