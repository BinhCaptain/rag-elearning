import { LessonsService } from './lessons.service';
import { CreateLessonDto, UpdateLessonDto } from './dto/lesson.dto';
export declare class LessonsController {
    private readonly lessonsService;
    constructor(lessonsService: LessonsService);
    findByCourse(courseId: string): import("@prisma/client").Prisma.PrismaPromise<{
        id: string;
        courseId: string;
        title: string;
        content: string | null;
        order: number;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(id: string): Promise<{
        prevLessonId: string | null;
        nextLessonId: string | null;
        quizzes: {
            id: string;
        }[];
        id: string;
        courseId: string;
        title: string;
        content: string | null;
        order: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    create(dto: CreateLessonDto): import("@prisma/client").Prisma.Prisma__LessonClient<{
        id: string;
        courseId: string;
        title: string;
        content: string | null;
        order: number;
        createdAt: Date;
        updatedAt: Date;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    update(id: string, dto: UpdateLessonDto): Promise<{
        id: string;
        courseId: string;
        title: string;
        content: string | null;
        order: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string): Promise<{
        id: string;
        courseId: string;
        title: string;
        content: string | null;
        order: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
