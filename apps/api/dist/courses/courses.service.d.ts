import { PrismaService } from '../prisma/prisma.service';
import { CreateCourseDto, UpdateCourseDto } from './dto/course.dto';
export declare class CoursesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(isAdmin?: boolean): import("@prisma/client").Prisma.PrismaPromise<({
        _count: {
            lessons: number;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string | null;
        level: string | null;
        isPublished: boolean;
    })[]>;
    findOne(id: string): Promise<{
        lessons: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            order: number;
            courseId: string;
            content: string | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string | null;
        level: string | null;
        isPublished: boolean;
    }>;
    create(dto: CreateCourseDto): import("@prisma/client").Prisma.Prisma__CourseClient<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string | null;
        level: string | null;
        isPublished: boolean;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    update(id: string, dto: UpdateCourseDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string | null;
        level: string | null;
        isPublished: boolean;
    }>;
    remove(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string | null;
        level: string | null;
        isPublished: boolean;
    }>;
}
