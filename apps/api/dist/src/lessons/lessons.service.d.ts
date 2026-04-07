import { PrismaService } from '../prisma/prisma.service';
import { CreateLessonDto, UpdateLessonDto } from './dto/lesson.dto';
export declare class LessonsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
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
    findOne(id: string, userId?: string): Promise<{
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
    toggleProgress(lessonId: string, userId: string): Promise<{
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
