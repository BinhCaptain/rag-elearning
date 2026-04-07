import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/send-message.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

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
}
