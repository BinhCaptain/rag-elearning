import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/send-message.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@UseGuards(JwtAuthGuard)
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  /**
   * POST /api/v1/chat
   * Gửi tin nhắn tới AI chatbot (RAG pipeline)
   */
  @Post()
  async sendMessage(@Request() req: any, @Body() dto: SendMessageDto) {
    return this.chatService.sendMessage(req.user.id, dto);
  }

  /**
   * GET /api/v1/chat/sessions
   * Lấy danh sách sessions của user hiện tại
   */
  @Get('sessions')
  async getSessions(@Request() req: any) {
    return this.chatService.getSessions(req.user.id);
  }

  /**
   * GET /api/v1/chat/sessions/:sessionId/messages
   * Lấy lịch sử tin nhắn của 1 session
   */
  @Get('sessions/:sessionId/messages')
  async getSessionMessages(@Request() req: any, @Param('sessionId') sessionId: string) {
    return this.chatService.getSessionMessages(sessionId, req.user.id);
  }

  // ─── Admin Endpoints ──────────────────────────────────────────────────────────

  /**
   * GET /api/v1/chat/admin/sessions
   * Lấy toàn bộ sessions của tất cả users (Admin)
   */
  @Get('admin/sessions')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  async getAllSessions(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '50',
  ) {
    return this.chatService.getAllSessions(Number(page), Number(limit));
  }

  /**
   * GET /api/v1/chat/admin/sessions/:sessionId/messages
   * Lấy messages của session bất kỳ (Admin)
   */
  @Get('admin/sessions/:sessionId/messages')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  async getAdminSessionMessages(@Param('sessionId') sessionId: string) {
    return this.chatService.getAdminSessionMessages(sessionId);
  }

  /**
   * DELETE /api/v1/chat/admin/sessions/:sessionId
   * Xóa session (Admin)
   */
  @Delete('admin/sessions/:sessionId')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteSession(@Param('sessionId') sessionId: string) {
    await this.chatService.deleteSessionByAdmin(sessionId);
  }
}
