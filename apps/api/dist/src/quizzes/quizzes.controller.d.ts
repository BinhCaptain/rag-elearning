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
                questionId: string;
                isCorrect: boolean;
            }[];
        } & {
            id: string;
            quizId: string;
            content: string;
            explanation: string | null;
        })[];
    } & {
        id: string;
        lessonId: string;
        title: string;
    })[]>;
    findOne(id: string): Promise<{
        questions: ({
            options: {
                id: string;
                content: string;
                questionId: string;
                isCorrect: boolean;
            }[];
        } & {
            id: string;
            quizId: string;
            content: string;
            explanation: string | null;
        })[];
    } & {
        id: string;
        lessonId: string;
        title: string;
    }>;
    create(dto: CreateQuizDto): Promise<{
        questions: ({
            options: {
                id: string;
                content: string;
                questionId: string;
                isCorrect: boolean;
            }[];
        } & {
            id: string;
            quizId: string;
            content: string;
            explanation: string | null;
        })[];
    } & {
        id: string;
        lessonId: string;
        title: string;
    }>;
    submit(id: string, dto: SubmitQuizDto, req: any): Promise<{
        id: string;
        quizId: string;
        score: number;
        totalQuestions: number;
        createdAt: Date;
        userId: string;
    }>;
}
