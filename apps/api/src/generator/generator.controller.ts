import {
  Controller,
  Post,
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

@UseGuards(JwtAuthGuard)
@Controller('admin/generator')
export class GeneratorController {
  constructor(private readonly generatorService: GeneratorService) {}

  @Post('analyze')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
      fileFilter: (_req, file, cb) => {
        const allowed = ['.pdf', '.docx', '.doc', '.txt', '.md'];
        const ext = '.' + file.originalname.split('.').pop()?.toLowerCase();
        if (allowed.includes(ext)) {
          cb(null, true);
        } else {
          cb(new BadRequestException(`File type not supported: ${ext}`), false);
        }
      },
    }),
  )
  async analyzeExamDraft(
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('Không tìm thấy file');
    
    return this.generatorService.analyzeAndGenerateDraft(file);
  }

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
}
