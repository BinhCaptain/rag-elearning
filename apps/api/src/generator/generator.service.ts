import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { PrismaService } from '../prisma/prisma.service';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require('pdf-parse');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const mammoth = require('mammoth');

@Injectable()
export class GeneratorService {
  private readonly logger = new Logger(GeneratorService.name);
  private readonly geminiKeys: string[];
  private currentKeyIndex = 0;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const keysStr = this.configService.get<string>('GEMINI_API_KEYS') || '';
    const singleKey = this.configService.get<string>('GEMINI_API_KEY') || '';
    const parsed = keysStr.split(',').map(k => k.trim()).filter(Boolean);
    this.geminiKeys = parsed.length > 0 ? parsed : (singleKey ? [singleKey] : []);
    this.logger.log(`Loaded ${this.geminiKeys.length} Gemini API key(s) for rotation`);
  }

  /** Mock exam JSON dùng khi AI_MOCK_MODE=true (để test khi API keys bị rate-limit) */
  private getMockExamData(filename: string): string {
    const mock = {
      title: `[MOCK] Đề Kiểm Tra Tiếng Anh - ${filename}`,
      questions: [
        {
          content: "The manager suggested that the team ___ the project deadline by two weeks.",
          explanation: "'Postpone' nghĩa là trì hoãn, dời lại — phù hợp nhất với ngữ cảnh đề nghị dời deadline. 'Advance' nghĩa là đẩy lên sớm hơn, 'cancel' là hủy bỏ, 'approve' là phê duyệt.",
          options: [
            { content: "postpone", isCorrect: true },
            { content: "advance", isCorrect: false },
            { content: "cancel", isCorrect: false },
            { content: "approve", isCorrect: false },
          ],
        },
        {
          content: "_____ completing the course, participants will receive a certificate of achievement.",
          explanation: "'Upon' được dùng để chỉ thời điểm ngay sau khi một hành động hoàn thành ('upon completing' = ngay sau khi hoàn thành). Các từ còn lại không phù hợp về cú pháp hoặc ngữ nghĩa trong ngữ cảnh này.",
          options: [
            { content: "While", isCorrect: false },
            { content: "Upon", isCorrect: true },
            { content: "Although", isCorrect: false },
            { content: "Unless", isCorrect: false },
          ],
        },
        {
          content: "The new regulations will have a significant ___ on small businesses.",
          explanation: "'Impact' là danh từ thường dùng nhất với cụm 'have an impact on something', nghĩa là tác động đến. Các đáp án còn lại không phù hợp về collocation trong tiếng Anh văn phòng.",
          options: [
            { content: "effect", isCorrect: false },
            { content: "impact", isCorrect: true },
            { content: "influence", isCorrect: false },
            { content: "result", isCorrect: false },
          ],
        },
        {
          content: "Employees are required to ___ their expense reports by the end of each month.",
          explanation: "'Submit' có nghĩa là nộp/gửi, là động từ phù hợp nhất với báo cáo chi phí (expense reports). 'Write' chỉ hành động viết, 'request' là yêu cầu, 'review' là xem xét.",
          options: [
            { content: "write", isCorrect: false },
            { content: "request", isCorrect: false },
            { content: "submit", isCorrect: true },
            { content: "review", isCorrect: false },
          ],
        },
        {
          content: "The conference will be held ___ March 15th ___ 17th at the Grand Hotel.",
          explanation: "Cấu trúc 'from ... to ...' dùng để chỉ khoảng thời gian từ ngày này đến ngày kia. Đây là cấu trúc cố định trong tiếng Anh khi nói về thời gian sự kiện.",
          options: [
            { content: "from / to", isCorrect: true },
            { content: "between / and", isCorrect: false },
            { content: "since / until", isCorrect: false },
            { content: "during / through", isCorrect: false },
          ],
        },
      ],
    };
    return JSON.stringify(mock);
  }

  /** Gọi Gemini REST API trực tiếp (không qua OpenAI proxy) với key rotation */
  private async callGeminiDirect(prompt: string): Promise<string> {
    // Mock mode: bỏ qua gọi API thật, trả về dữ liệu mẫu
    const mockMode = this.configService.get<string>('AI_MOCK_MODE') === 'true';
    if (mockMode) {
      this.logger.warn('⚠️  AI_MOCK_MODE=true — trả về đề thi mẫu (mock) cho testing');
      await new Promise(r => setTimeout(r, 1500)); // giả lập latency
      return this.getMockExamData('sample');
    }

    const totalKeys = this.geminiKeys.length;
    let lastError: any;

    for (let attempt = 0; attempt < totalKeys; attempt++) {
      const keyIdx = (this.currentKeyIndex + attempt) % totalKeys;
      const apiKey = this.geminiKeys[keyIdx];
      // Thử các model theo thứ tự ưu tiên
      const models = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-flash-latest'];

      for (const model of models) {
        try {
          this.logger.log(`Trying key #${keyIdx + 1}/${totalKeys} with model: ${model}`);
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

          const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 8192,
              },
            }),
          });

          if (!response.ok) {
            const errText = await response.text();
            this.logger.warn(`Key #${keyIdx + 1}, model ${model}: HTTP ${response.status} — ${errText.substring(0, 200)}`);
            lastError = new Error(`HTTP ${response.status}: ${errText.substring(0, 100)}`);
            // 429 hoặc 503 → thử key kế, không thử model kế
            if (response.status === 429 || response.status === 503) break;
            continue; // 400/404 → thử model kế
          }

          const data = await response.json();
          const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (!text) throw new Error('Gemini không trả về nội dung');

          this.currentKeyIndex = keyIdx;
          this.logger.log(`Success with key #${keyIdx + 1}, model: ${model}`);
          return text;

        } catch (err: any) {
          this.logger.warn(`Key #${keyIdx + 1}, model ${model}: ${err.message}`);
          lastError = err;
        }
      }
    }

    throw lastError || new Error('Tất cả Gemini API keys/models đều thất bại');
  }

  async analyzeAndGenerateDraft(file: Express.Multer.File) {
    try {
      const text = await this.extractText(file);
      this.logger.log(`Extracted ${text.length} chars from: ${file.originalname}`);

      const prompt = `Bạn là chuyên gia giáo dục ngôn ngữ AI. Hãy phân tích đề thi mẫu dưới đây và sinh ra MỘT ĐỀ THI MỚI hoàn toàn khác, giữ nguyên format, độ khó và thể loại. Sinh tối đa 10 câu hỏi trắc nghiệm 4 đáp án (A,B,C,D).

Đề mẫu:
"""
${text.substring(0, 25000)}
"""

Yêu cầu:
- Nội dung câu hỏi PHẢI khác hoàn toàn với đề mẫu
- Mỗi câu có đúng 1 đáp án đúng, 3 đáp án nhiễu hợp lý
- Có giải thích tại sao đáp án đúng là đúng

CHỈ TRẢ VỀ JSON THUẦN TÚY (không có markdown, không có text ngoài JSON):
{"title":"Tên đề thi","questions":[{"content":"Câu hỏi","explanation":"Giải thích","options":[{"content":"Đáp án A","isCorrect":false},{"content":"Đáp án B","isCorrect":true},{"content":"Đáp án C","isCorrect":false},{"content":"Đáp án D","isCorrect":false}]}]}`;

      const responseText = await this.callGeminiDirect(prompt);

      let examData;
      try {
        const cleanText = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
        // Tìm JSON object đầu tiên trong response
        const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error('Không tìm thấy JSON trong response');
        examData = JSON.parse(jsonMatch[0]);
      } catch (e: any) {
        this.logger.error('Raw AI response (first 500):', responseText.substring(0, 500));
        throw new Error(`Định dạng JSON lỗi: ${e.message}`);
      }

      if (!examData.questions || examData.questions.length === 0) {
        throw new Error('AI không sinh được câu hỏi nào');
      }

      this.logger.log(`Generated ${examData.questions.length} questions for: ${examData.title}`);
      return examData;

    } catch (err: any) {
      this.logger.error('Error generating draft:', err.message);
      throw new InternalServerErrorException(err.message || 'Lỗi khi tạo bản nháp đề thi');
    }
  }

  async saveExamToDB(courseId: string, lessonTitle: string, examData: any) {
    try {
      const count = await this.prisma.lesson.count({ where: { courseId } });
      const newLesson = await this.prisma.lesson.create({
        data: { title: lessonTitle, courseId, order: count + 1 },
      });

      const newQuiz = await this.prisma.quiz.create({
        data: { title: examData.title || 'Đề thi AI Sinh', lessonId: newLesson.id },
      });

      for (const q of (examData.questions || [])) {
        await this.prisma.question.create({
          data: {
            quizId: newQuiz.id,
            content: q.content,
            explanation: q.explanation,
            options: {
              create: (q.options || []).map((opt: any) => ({
                content: opt.content,
                isCorrect: opt.isCorrect,
              })),
            },
          },
        });
      }

      return {
        success: true,
        message: `Đề thi "${lessonTitle}" đã được lưu thành công với ${examData.questions?.length || 0} câu hỏi!`,
        lessonId: newLesson.id,
        quizId: newQuiz.id,
        totalQuestions: examData.questions?.length || 0,
      };
    } catch (err: any) {
      this.logger.error('Error saving exam:', err.message);
      throw new InternalServerErrorException(err.message || 'Lỗi khi lưu đề thi vào hệ thống');
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
}
