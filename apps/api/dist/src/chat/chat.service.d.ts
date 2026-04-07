import { PrismaService } from '../prisma/prisma.service';
export declare class ChatService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    generateResponse(userId: string, message: string, lessonId?: string): Promise<{
        role: string;
        content: string;
        timestamp: Date;
    }>;
}
