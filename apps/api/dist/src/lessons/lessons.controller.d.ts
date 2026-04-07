import { LessonsService } from './lessons.service';
import { CreateLessonDto, UpdateLessonDto } from './dto/lesson.dto';
export declare class LessonsController {
    private readonly lessonsService;
    constructor(lessonsService: LessonsService);
    findByCourse(courseId: string): import("@prisma/client").Prisma.PrismaPromise<{
        id: string;
        title: string;
        createdAt: Date;
        updatedAt: Date;
        content: string | null;
        videoUrl: string | null;
        order: number;
        courseId: string;
    }[]>;
    findOne(id: string, req: any): Promise<{
        prevLessonId: string | null;
        nextLessonId: string | null;
        isCompleted: boolean;
        quizzes: {
            id: string;
        }[];
        id: string;
        title: string;
        createdAt: Date;
        updatedAt: Date;
        content: string | null;
        videoUrl: string | null;
        order: number;
        courseId: string;
    }>;
    toggleProgress(id: string, req: any): Promise<{
        id: string;
        userId: string;
        status: import("@prisma/client").$Enums.ProgressStatus;
        completedAt: Date | null;
        lessonId: string;
    }>;
    create(dto: CreateLessonDto): Promise<{
        id: string;
        title: string;
        createdAt: Date;
        updatedAt: Date;
        content: string | null;
        videoUrl: string | null;
        order: number;
        courseId: string;
    }>;
    update(id: string, dto: UpdateLessonDto): Promise<{
        id: string;
        title: string;
        createdAt: Date;
        updatedAt: Date;
        content: string | null;
        videoUrl: string | null;
        order: number;
        courseId: string;
    }>;
    remove(id: string): Promise<{
        id: string;
        title: string;
        createdAt: Date;
        updatedAt: Date;
        content: string | null;
        videoUrl: string | null;
        order: number;
        courseId: string;
    }>;
}
