import {
  Controller,
  Post,
  Get,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Request,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { IngestionService } from './ingestion.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('admin/documents')
export class IngestionController {
  constructor(private readonly ingestionService: IngestionService) {}

  /**
   * POST /api/v1/admin/documents/upload
   * Upload tài liệu để RAG ingestion (Admin only)
   */
  @Post('upload')
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
  async uploadDocument(
    @UploadedFile() file: Express.Multer.File,
    @Request() req: any,
    @Query('lessonId') lessonId?: string,
  ) {
    if (!file) throw new BadRequestException('Không tìm thấy file');
    return this.ingestionService.uploadDocument(file, lessonId, req.user.userId);
  }

  /**
   * GET /api/v1/admin/documents
   * Lấy danh sách documents đã upload
   */
  @Get()
  async getDocuments(@Request() req: any) {
    return this.ingestionService.getDocuments(req.user.userId);
  }
}
