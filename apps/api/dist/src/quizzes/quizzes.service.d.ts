import { PrismaService } from '../prisma/prisma.service';
import { CreateQuizDto, SubmitQuizDto } from './dto/quiz.dto';
export declare class QuizzesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findByLesson(lessonId: string): Promise<({
        questions: ({
            options: {
                id: string;
                content: string;
                isCorrect: boolean;
                questionId: string;
            }[];
        } & {
            id: string;
            content: string;
            explanation: string | null;
            quizId: string;
        })[];
    } & {
        id: string;
        title: string;
        lessonId: string;
    })[]>;
    findOne(id: string): Promise<{
        questions: ({
            options: {
                id: string;
                content: string;
                isCorrect: boolean;
                questionId: string;
            }[];
        } & {
            id: string;
            content: string;
            explanation: string | null;
            quizId: string;
        })[];
    } & {
        id: string;
        title: string;
        lessonId: string;
    }>;
    create(dto: CreateQuizDto): Promise<{
        questions: ({
            options: {
                id: string;
                content: string;
                isCorrect: boolean;
                questionId: string;
            }[];
        } & {
            id: string;
            content: string;
            explanation: string | null;
            quizId: string;
        })[];
    } & {
        id: string;
        title: string;
        lessonId: string;
    }>;
    submitAttempt(userId: string, quizId: string, dto: SubmitQuizDto): Promise<{
        id: string;
        createdAt: Date;
        score: number;
        totalQuestions: number;
        quizId: string;
        userId: string;
    }>;
}
