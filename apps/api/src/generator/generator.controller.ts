import {
  Controller,
  Post,
  Get,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GeneratorService } from './generator.service';

const ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.doc', '.txt', '.md'];
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

function buildFileInterceptor() {
  return FileInterceptor('file', {
    storage: memoryStorage(),
    limits: { fileSize: MAX_FILE_SIZE },
    fileFilter: (_req, file, cb) => {
      const ext = '.' + file.originalname.split('.').pop()?.toLowerCase();
      if (ALLOWED_EXTENSIONS.includes(ext)) {
        cb(null, true);
      } else {
        cb(new BadRequestException(`File type not supported: ${ext}. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`), false);
      }
    },
  });
}

@UseGuards(JwtAuthGuard)
@Controller('admin/generator')
export class GeneratorController {
  constructor(private readonly generatorService: GeneratorService) {}

  // ─── Existing endpoints ────────────────────────────────────────────────────

  /** Original flow: upload any doc → AI generates a new exam draft directly */
  @Post('analyze')
  @UseInterceptors(buildFileInterceptor())
  async analyzeExamDraft(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Không tìm thấy file');
    return this.generatorService.analyzeAndGenerateDraft(file);
  }

  /** Save a generated exam draft into the course DB */
  @Post('save')
  async saveExam(
    @Body('courseId') courseId: string,
    @Body('lessonTitle') lessonTitle: string,
    @Body('examData') examData: any,
  ) {
    if (!courseId) throw new BadRequestException('Thiếu courseId');
    if (!lessonTitle) throw new BadRequestException('Thiếu lessonTitle');
    if (!examData) throw new BadRequestException('Thiếu examData');
    return this.generatorService.saveExamToDB(courseId, lessonTitle, examData);
  }

  // ─── New endpoints — Generate Exam from Sample File ───────────────────────

  /**
   * POST /api/v1/admin/generator/analyze-sample
   * Upload a .txt exam file → parse questions → classify with AI → return structure analysis
   */
  @Post('analyze-sample')
  @UseInterceptors(buildFileInterceptor())
  async analyzeSampleFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Không tìm thấy file');
    return this.generatorService.analyzeSampleFile(file);
  }

  /**
   * POST /api/v1/admin/generator/generate-from-sample
   * Given an analysis ID + config → AI generates a brand-new exam
   */
  @Post('generate-from-sample')
  async generateFromSample(
    @Body('sourceAnalysisId') sourceAnalysisId: string,
    @Body('totalQuestions') totalQuestions: number,
    @Body('categories') categories: Record<string, number>,
    @Body('difficulty') difficulty: string,
    @Body('includeAnswers') includeAnswers: boolean,
    @Body('includeExplanations') includeExplanations: boolean,
    @Body('avoidDuplicates') avoidDuplicates: boolean,
  ) {
    if (!sourceAnalysisId) throw new BadRequestException('Thiếu sourceAnalysisId');
    if (!totalQuestions || totalQuestions < 1) throw new BadRequestException('totalQuestions phải >= 1');
    if (!categories || Object.keys(categories).length === 0) throw new BadRequestException('Thiếu cấu hình categories');

    return this.generatorService.generateFromSampleAnalysis({
      sourceAnalysisId,
      totalQuestions: Number(totalQuestions),
      categories,
      difficulty: difficulty || 'Medium',
      includeAnswers: includeAnswers !== false,
      includeExplanations: includeExplanations !== false,
      avoidDuplicates: avoidDuplicates !== false,
    });
  }
}
