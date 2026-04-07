import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  async generateResponse(userId: string, message: string, lessonId?: string) {
    let context = "";
    
    if (lessonId) {
      const lesson = await this.prisma.lesson.findUnique({
        where: { id: lessonId },
        select: { title: true }
      });
      if (lesson) {
        context = `bài học "${lesson.title}"`;
      }
    }

    // Mock response logic (can be replaced with OpenAI/RAG later)
    const responses = [
      `Chào bạn! Về câu hỏi của bạn trong ${context || 'khóa học'}, tôi khuyên bạn nên tập trung vào các khái niệm cốt lõi đã học. Bạn có muốn tôi giải thích rõ hơn về một phần cụ thể nào không?`,
      `Đó là một thắc mắc rất thú vị liên quan đến ${context || 'chủ đề này'}. Trong thực tế, kiến thức này giúp chúng ta giải quyết các vấn đề về cấu trúc và logic rất hiệu quả.`,
      `Để học tốt ${context || 'nội dung này'}, bạn hãy thử kết hợp giữa việc đọc lý thuyết và làm bài tập trắc nghiệm đi kèm nhé. Tôi luôn ở đây để hỗ trợ bạn!`,
      `Tôi đã nhận được câu hỏi "${message}". Trong phạm vi ${context || 'bài học'}, điều quan trọng nhất là bạn nắm vững cách vận dụng linh hoạt các quy tắc đã được giới thiệu.`,
      `Chào bạn, tôi là AI Trợ giảng. Với ${context || 'bài học này'}, bạn có thể tham khảo thêm phần giải thích chi tiết trong các câu hỏi quiz để hiểu sâu hơn bản chất vấn đề.`
    ];

    const randomIndex = Math.floor(Math.random() * responses.length);
    
    return {
      role: 'assistant',
      content: responses[randomIndex],
      timestamp: new Date()
    };
  }
}
