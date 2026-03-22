import { QuizzesService } from './quizzes.service';
import { CreateQuizDto, SubmitQuizDto } from './dto/quiz.dto';
export declare class QuizzesController {
    private readonly quizzesService;
    constructor(quizzesService: QuizzesService);
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
    submit(id: string, dto: SubmitQuizDto, userId?: string): Promise<{
        id: string;
        createdAt: Date;
        score: number;
        totalQuestions: number;
        quizId: string;
        userId: string;
    }>;
}
