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
        order: number;
        courseId: string;
    }[]>;
    findOne(id: string): Promise<{
        prevLessonId: string | null;
        nextLessonId: string | null;
        quizzes: {
            id: string;
        }[];
        id: string;
        title: string;
        createdAt: Date;
        updatedAt: Date;
        content: string | null;
        order: number;
        courseId: string;
    }>;
    create(dto: CreateLessonDto): import("@prisma/client").Prisma.Prisma__LessonClient<{
        id: string;
        title: string;
        createdAt: Date;
        updatedAt: Date;
        content: string | null;
        order: number;
        courseId: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    update(id: string, dto: UpdateLessonDto): Promise<{
        id: string;
        title: string;
        createdAt: Date;
        updatedAt: Date;
        content: string | null;
        order: number;
        courseId: string;
    }>;
    remove(id: string): Promise<{
        id: string;
        title: string;
        createdAt: Date;
        updatedAt: Date;
        content: string | null;
        order: number;
        courseId: string;
    }>;
}
