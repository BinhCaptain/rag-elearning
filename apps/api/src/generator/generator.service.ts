import { Injectable, Logger, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { PrismaService } from '../prisma/prisma.service';
import { randomUUID } from 'crypto';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require('pdf-parse');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const mammoth = require('mammoth');

// ─── Types ───────────────────────────────────────────────────────────────────

interface ParsedQuestion {
  id: number;
  question: string;
  options: { A: string; B: string; C: string; D: string };
  answer?: string;
  explanation?: string;
}

interface ClassifiedQuestion extends ParsedQuestion {
  category: string;
  difficulty: string;
  confidence: number;
}

interface AnalysisResult {
  id: string;
  fileName: string;
  totalQuestions: number;
  categories: Record<string, number>;
  questions: ClassifiedQuestion[];
  createdAt: Date;
}

// ─── Service ─────────────────────────────────────────────────────────────────

@Injectable()
export class GeneratorService {
  private readonly logger = new Logger(GeneratorService.name);
  private readonly geminiKeys: string[];
  private currentKeyIndex = 0;

  /** In-memory store for analysis results (keyed by UUID) */
  private readonly analysisStore = new Map<string, AnalysisResult>();

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

  // ═══════════════════════════════════════════════════════════════════════════
  // SECTION 1: EXISTING METHODS (unchanged)
  // ═══════════════════════════════════════════════════════════════════════════

  private getMockExamData(filename: string, isFallback = false): string {
    const prefix = isFallback ? '[Rate-limited] ' : '[MOCK] ';
    const mock = {
      title: `${prefix}Đề Kiểm Tra Tiếng Anh - ${filename}`,
      _isMock: true,
      _reason: isFallback ? 'rate_limited' : 'mock_mode',
      questions: [
        {
          content: "The manager suggested that the team ___ the project deadline by two weeks.",
          explanation: "'Postpone' nghĩa là trì hoãn, dời lại — phù hợp nhất với ngữ cảnh đề nghị dời deadline.",
          options: [
            { content: "postpone", isCorrect: true },
            { content: "advance", isCorrect: false },
            { content: "cancel", isCorrect: false },
            { content: "approve", isCorrect: false },
          ],
        },
        {
          content: "_____ completing the course, participants will receive a certificate of achievement.",
          explanation: "'Upon' được dùng để chỉ thời điểm ngay sau khi một hành động hoàn thành.",
          options: [
            { content: "While", isCorrect: false },
            { content: "Upon", isCorrect: true },
            { content: "Although", isCorrect: false },
            { content: "Unless", isCorrect: false },
          ],
        },
        {
          content: "The new regulations will have a significant ___ on small businesses.",
          explanation: "'Impact' là danh từ thường dùng nhất với cụm 'have an impact on something'.",
          options: [
            { content: "effect", isCorrect: false },
            { content: "impact", isCorrect: true },
            { content: "influence", isCorrect: false },
            { content: "result", isCorrect: false },
          ],
        },
        {
          content: "Employees are required to ___ their expense reports by the end of each month.",
          explanation: "'Submit' có nghĩa là nộp/gửi, là động từ phù hợp nhất với báo cáo chi phí.",
          options: [
            { content: "write", isCorrect: false },
            { content: "request", isCorrect: false },
            { content: "submit", isCorrect: true },
            { content: "review", isCorrect: false },
          ],
        },
        {
          content: "The conference will be held ___ March 15th ___ 17th at the Grand Hotel.",
          explanation: "Cấu trúc 'from ... to ...' dùng để chỉ khoảng thời gian từ ngày này đến ngày kia.",
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

  private async callGeminiDirect(prompt: string): Promise<{ text: string; isFallback: boolean }> {
    const mockMode = this.configService.get<string>('AI_MOCK_MODE') === 'true';
    if (mockMode) {
      this.logger.warn('⚠️  AI_MOCK_MODE=true — trả về đề thi mẫu (mock) cho testing');
      await new Promise(r => setTimeout(r, 1500));
      return { text: this.getMockExamData('sample'), isFallback: false };
    }

    if (this.geminiKeys.length === 0) {
      this.logger.warn('⚠️  Không có Gemini API key — fallback về mock data');
      await new Promise(r => setTimeout(r, 1000));
      return { text: this.getMockExamData('no-key', true), isFallback: true };
    }

    const totalKeys = this.geminiKeys.length;
    let lastError: any;
    let allRateLimited = true;

    for (let attempt = 0; attempt < totalKeys; attempt++) {
      const keyIdx = (this.currentKeyIndex + attempt) % totalKeys;
      const apiKey = this.geminiKeys[keyIdx];
      const models = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-flash-latest'];

      for (const model of models) {
        try {
          this.logger.log(`Trying key #${keyIdx + 1}/${totalKeys} with model: ${model}`);
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

          const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { temperature: 0.7, maxOutputTokens: 8192 },
            }),
          });

          if (!response.ok) {
            const errText = await response.text();
            this.logger.warn(`Key #${keyIdx + 1}, model ${model}: HTTP ${response.status}`);
            lastError = new Error(`HTTP ${response.status}: ${errText.substring(0, 100)}`);
            if (response.status === 429 || response.status === 503) break;
            allRateLimited = false;
            continue;
          }

          const data = await response.json();
          const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (!text) throw new Error('Gemini không trả về nội dung');

          this.currentKeyIndex = keyIdx;
          this.logger.log(`Success with key #${keyIdx + 1}, model: ${model}`);
          return { text, isFallback: false };

        } catch (err: any) {
          this.logger.warn(`Key #${keyIdx + 1}, model ${model}: ${err.message}`);
          lastError = err;
        }
      }
    }

    if (allRateLimited) {
      this.logger.warn('⚠️  Tất cả Gemini API keys đều bị rate limit — fallback về mock data');
      return { text: this.getMockExamData('rate-limited', true), isFallback: true };
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

      const { text: responseText, isFallback } = await this.callGeminiDirect(prompt);

      let examData;
      try {
        const cleanText = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
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
      return { ...examData, _isFallback: isFallback };

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

  // ═══════════════════════════════════════════════════════════════════════════
  // SECTION 2: NEW METHODS — Generate Exam from Sample File
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Parse a .txt exam file into individual question objects.
   * Handles common Vietnamese English exam formats.
   */
  private parseQuestionsFromTxt(text: string): ParsedQuestion[] {
    const questions: ParsedQuestion[] = [];
    const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    // Find all question start positions using various patterns:
    // "Câu 1:", "Question 1:", "1.", "1)", "(1)"
    const questionStartRegex =
      /(?:^|\n)[ \t]*(?:(?:câu|question|q\.?|câu hỏi|ex)[ \t]*)?\(?(\d{1,3})\)?[:\.\)]\s+/gi;

    const starts: { index: number; num: number; matchEnd: number }[] = [];
    let m: RegExpExecArray | null;
    while ((m = questionStartRegex.exec(normalized)) !== null) {
      const num = parseInt(m[1]);
      if (num >= 1 && num <= 300) {
        starts.push({ index: m.index, num, matchEnd: m.index + m[0].length });
      }
    }

    for (let i = 0; i < starts.length; i++) {
      const blockStart = starts[i].matchEnd;
      const blockEnd = i + 1 < starts.length ? starts[i + 1].index : normalized.length;
      const block = normalized.slice(blockStart, blockEnd);
      const parsed = this.parseQuestionBlock(block, starts[i].num);
      if (parsed) questions.push(parsed);
    }

    return questions;
  }

  private parseQuestionBlock(block: string, questionNum: number): ParsedQuestion | null {
    const lines = block.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length === 0) return null;

    const optionRegex = /^([A-D])[:\.\)]\s*(.+)$/i;
    const answerRegex = /(?:đáp án|answer|key|ans|correct)[:\s]+([A-D])\b/i;
    const explanationRegex = /(?:giải thích|explanation|note|expl)[:\s]+(.+)/i;

    const options: Record<string, string> = {};
    let questionText = '';
    let answer: string | undefined;
    let explanation: string | undefined;
    let parsingOptions = false;

    for (const line of lines) {
      // Skip section headers (PHẦN, PART, SECTION ...)
      if (/^(?:phần|part|section|chapter)\s+\d+/i.test(line)) continue;

      const ansMatch = line.match(answerRegex);
      if (ansMatch) { answer = ansMatch[1].toUpperCase(); continue; }

      const expMatch = line.match(explanationRegex);
      if (expMatch) { explanation = expMatch[1].trim(); continue; }

      const optMatch = line.match(optionRegex);
      if (optMatch) {
        options[optMatch[1].toUpperCase()] = optMatch[2].trim();
        parsingOptions = true;
        continue;
      }

      // If we haven't started options yet, accumulate as question text
      if (!parsingOptions) {
        questionText += (questionText ? ' ' : '') + line;
      }
    }

    if (!questionText.trim()) return null;
    if (Object.keys(options).length < 2) return null;

    return {
      id: questionNum,
      question: questionText.trim(),
      options: {
        A: options['A'] || '',
        B: options['B'] || '',
        C: options['C'] || '',
        D: options['D'] || '',
      },
      answer,
      explanation,
    };
  }

  /**
   * Use Gemini to batch-classify questions into categories + difficulty.
   */
  private async classifyQuestionsWithAI(
    questions: ParsedQuestion[],
  ): Promise<ClassifiedQuestion[]> {
    if (questions.length === 0) return [];

    // Batch into groups of 30 to fit token limits
    const BATCH_SIZE = 30;
    const classified: ClassifiedQuestion[] = [];

    for (let i = 0; i < questions.length; i += BATCH_SIZE) {
      const batch = questions.slice(i, i + BATCH_SIZE);

      const payload = batch.map(q => ({
        id: q.id,
        question: q.question.substring(0, 300),
        options: {
          A: q.options.A.substring(0, 100),
          B: q.options.B.substring(0, 100),
          C: q.options.C.substring(0, 100),
          D: q.options.D.substring(0, 100),
        },
      }));

      const prompt = `You are an English exam question classifier.

Classify each question into EXACTLY ONE of these categories:
Vocabulary, Grammar, Reading Comprehension, Pronunciation, Error Correction, Cloze Test, Other

For each question return:
- category: one of the above
- difficulty: Easy | Medium | Hard
- confidence: number 0.0 to 1.0

Questions:
${JSON.stringify(payload, null, 2)}

Return ONLY a JSON array with no markdown fences:
[{"id": 1, "category": "Grammar", "difficulty": "Medium", "confidence": 0.92}, ...]`;

      try {
        const { text } = await this.callGeminiDirect(prompt);
        const clean = text.replace(/```json/gi, '').replace(/```/g, '').trim();
        const jsonMatch = clean.match(/\[[\s\S]*\]/);
        if (!jsonMatch) throw new Error('No JSON array in classification response');

        const cls: { id: number; category: string; difficulty: string; confidence: number }[] =
          JSON.parse(jsonMatch[0]);

        batch.forEach(q => {
          const c = cls.find(x => x.id === q.id) || {
            category: 'Other',
            difficulty: 'Medium',
            confidence: 0.5,
          };
          classified.push({ ...q, category: c.category, difficulty: c.difficulty, confidence: c.confidence });
        });
      } catch (err: any) {
        this.logger.warn(`Classification batch failed: ${err.message} — defaulting to Other`);
        batch.forEach(q =>
          classified.push({ ...q, category: 'Other', difficulty: 'Medium', confidence: 0.5 }),
        );
      }
    }

    return classified;
  }

  /**
   * Main entry point: parse + classify a sample exam file.
   */
  async analyzeSampleFile(file: Express.Multer.File): Promise<AnalysisResult> {
    try {
      const rawText = await this.extractText(file);
      this.logger.log(`Extracted ${rawText.length} chars from ${file.originalname}`);

      const parsed = this.parseQuestionsFromTxt(rawText);
      this.logger.log(`Parsed ${parsed.length} questions`);

      if (parsed.length === 0) {
        throw new Error(
          'Không phân tích được câu hỏi từ file. Hãy kiểm tra định dạng file — mỗi câu phải bắt đầu bằng số thứ tự (Câu 1, 1., 1) ...).',
        );
      }

      const classified = await this.classifyQuestionsWithAI(parsed);

      // Aggregate category counts
      const categories: Record<string, number> = {};
      classified.forEach(q => {
        categories[q.category] = (categories[q.category] || 0) + 1;
      });

      const result: AnalysisResult = {
        id: randomUUID(),
        fileName: file.originalname,
        totalQuestions: classified.length,
        categories,
        questions: classified,
        createdAt: new Date(),
      };

      this.analysisStore.set(result.id, result);
      this.logger.log(`Analysis stored with id: ${result.id}`);

      return result;
    } catch (err: any) {
      this.logger.error('analyzeSampleFile error:', err.message);
      throw new InternalServerErrorException(err.message || 'Lỗi phân tích file');
    }
  }

  /**
   * Generate a brand-new exam from an existing analysis.
   */
  async generateFromSampleAnalysis(params: {
    sourceAnalysisId: string;
    totalQuestions: number;
    categories: Record<string, number>;
    difficulty: string;
    includeAnswers: boolean;
    includeExplanations: boolean;
    avoidDuplicates: boolean;
  }): Promise<any> {
    const analysis = this.analysisStore.get(params.sourceAnalysisId);
    if (!analysis) {
      throw new NotFoundException(
        'Không tìm thấy kết quả phân tích. Vui lòng upload và phân tích lại file.',
      );
    }

    // Build category distribution string
    const categoryStr = Object.entries(params.categories)
      .filter(([, n]) => n > 0)
      .map(([cat, n]) => `  - ${cat}: ${n} questions`)
      .join('\n');

    // Style reference — use up to 15 questions from the analysis, don't include answers
    const styleRef = analysis.questions
      .slice(0, 15)
      .map(
        q =>
          `[${q.category} | ${q.difficulty}]\n${q.question}\nA. ${q.options.A}\nB. ${q.options.B}\nC. ${q.options.C}\nD. ${q.options.D}`,
      )
      .join('\n\n');

    const prompt = `You are an expert English exam writer. Generate a brand-new English multiple-choice exam.

CATEGORY DISTRIBUTION (total ${params.totalQuestions} questions):
${categoryStr}

OVERALL DIFFICULTY: ${params.difficulty}

STYLE REFERENCE — study these for question style and topic domain ONLY. Do NOT copy them:
"""
${styleRef.substring(0, 8000)}
"""

REQUIREMENTS:
- ${params.avoidDuplicates ? 'All questions must be completely different from the style reference above.' : 'Questions may overlap in topic but not in wording.'}
- Each question must have exactly 4 options (A, B, C, D), one correct answer.
- Match the difficulty level: ${params.difficulty}.
- ${params.includeAnswers ? 'Include the correct answer key.' : 'Do NOT include answers.'}
- ${params.includeExplanations ? 'Include a brief explanation for the correct answer.' : 'Do NOT include explanations.'}

Return ONLY valid JSON — no markdown, no extra text:
{
  "title": "Generated English Exam",
  "questions": [
    {
      "number": 1,
      "category": "Grammar",
      "difficulty": "Medium",
      "question": "...",
      "options": {"A": "...", "B": "...", "C": "...", "D": "..."},
      "answer": "B",
      "explanation": "..."
    }
  ]
}`;

    try {
      const { text, isFallback } = await this.callGeminiDirect(prompt);
      const clean = text.replace(/```json/gi, '').replace(/```/g, '').trim();
      const jsonMatch = clean.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON in generation response');

      const examData = JSON.parse(jsonMatch[0]);

      if (!examData.questions || examData.questions.length === 0) {
        throw new Error('AI không sinh được câu hỏi nào');
      }

      this.logger.log(`Generated ${examData.questions.length} questions from analysis ${params.sourceAnalysisId}`);

      return {
        ...examData,
        totalQuestions: examData.questions.length,
        _isFallback: isFallback,
        _sourceAnalysisId: params.sourceAnalysisId,
      };
    } catch (err: any) {
      this.logger.error('generateFromSampleAnalysis error:', err.message);
      throw new InternalServerErrorException(err.message || 'Lỗi khi sinh đề từ phân tích');
    }
  }
}
