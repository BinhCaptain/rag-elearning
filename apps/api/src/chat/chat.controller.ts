import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async chat(@Body() body: { message: string; lessonId?: string }, @Request() req: any) {
    return this.chatService.generateResponse(req.user.id, body.message, body.lessonId);
  }
}
