import { LessonsService } from './lessons.service';
import { CreateLessonDto, UpdateLessonDto } from './dto/lesson.dto';
export declare class LessonsController {
    private readonly lessonsService;
    constructor(lessonsService: LessonsService);
    findByCourse(courseId: string): import("@prisma/client").Prisma.PrismaPromise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        order: number;
        courseId: string;
        content: string | null;
    }[]>;
    findOne(id: string): Promise<{
        quizzes: {
            id: string;
            lessonId: string;
            title: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        order: number;
        courseId: string;
        content: string | null;
    }>;
    create(dto: CreateLessonDto): import("@prisma/client").Prisma.Prisma__LessonClient<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        order: number;
        courseId: string;
        content: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    update(id: string, dto: UpdateLessonDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        order: number;
        courseId: string;
        content: string | null;
    }>;
    remove(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        order: number;
        courseId: string;
        content: string | null;
    }>;
}
