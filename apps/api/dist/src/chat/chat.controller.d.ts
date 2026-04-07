import { ChatService } from './chat.service';
export declare class ChatController {
    private readonly chatService;
    constructor(chatService: ChatService);
    chat(body: {
        message: string;
        lessonId?: string;
    }, req: any): Promise<{
        role: string;
        content: string;
        timestamp: Date;
    }>;
}
