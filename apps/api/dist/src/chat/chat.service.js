"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ChatService = class ChatService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async generateResponse(userId, message, lessonId) {
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
};
exports.ChatService = ChatService;
exports.ChatService = ChatService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ChatService);
//# sourceMappingURL=chat.service.js.map