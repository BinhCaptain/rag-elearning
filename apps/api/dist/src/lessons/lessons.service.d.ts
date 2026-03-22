import { PrismaService } from '../prisma/prisma.service';
import { CreateLessonDto, UpdateLessonDto } from './dto/lesson.dto';
export declare class LessonsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findByCourse(courseId: string): import("@prisma/client").Prisma.PrismaPromise<{
        content: string | null;
        title: string;
        courseId: string;
        videoUrl: string | null;
        order: number;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(id: string): Promise<{
        prevLessonId: string | null;
        nextLessonId: string | null;
        quizzes: {
            id: string;
        }[];
        content: string | null;
        title: string;
        courseId: string;
        videoUrl: string | null;
        order: number;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    create(dto: CreateLessonDto): Promise<{
        content: string | null;
        title: string;
        courseId: string;
        videoUrl: string | null;
        order: number;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, dto: UpdateLessonDto): Promise<{
        content: string | null;
        title: string;
        courseId: string;
        videoUrl: string | null;
        order: number;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string): Promise<{
        content: string | null;
        title: string;
        courseId: string;
        videoUrl: string | null;
        order: number;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
