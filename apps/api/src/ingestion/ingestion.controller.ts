import {
  Controller,
  Post,
  Get,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Request,
  Query,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { IngestionService } from './ingestion.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('ingestion')
export class IngestionController {
  constructor(private readonly ingestionService: IngestionService) {}

  /**
   * POST /api/v1/ingestion/upload
   * Upload tài liệu để RAG ingestion (Admin/User)
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
    @Body('topic') topic?: string,
    @Body('level') level?: string,
    @Query('lessonId') lessonId?: string,
  ) {
    if (!file) throw new BadRequestException('Không tìm thấy file');
    const userId = req.user.userId || req.user.sub || req.user.id || 'admin-system';
    return this.ingestionService.uploadDocument(file, lessonId, userId, topic, level);
  }

  /**
   * GET /api/v1/ingestion/search?q=...
   * Tìm kiếm vector RAG chunks
   */
  @Get('search')
  async search(@Query('q') query: string) {
    if (!query) throw new BadRequestException('Query parameter q is required');
    return this.ingestionService.search(query);
  }

  /**
   * GET /api/v1/ingestion
   * Lấy danh sách documents đã upload
   */
  @Get()
  async getDocuments(@Request() req: any) {
    return this.ingestionService.getDocuments(req.user.userId);
  }
}
