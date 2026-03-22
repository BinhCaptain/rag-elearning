import { CoursesService } from './courses.service';
import { CreateCourseDto, UpdateCourseDto } from './dto/course.dto';
export declare class CoursesController {
    private readonly coursesService;
    constructor(coursesService: CoursesService);
    findAll(isAdmin?: string): import("@prisma/client").Prisma.PrismaPromise<({
        _count: {
            lessons: number;
        };
    } & {
        id: string;
        title: string;
        description: string | null;
        level: string | null;
        isPublished: boolean;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    findOne(id: string): Promise<{
        lessons: {
            id: string;
            title: string;
            createdAt: Date;
            updatedAt: Date;
            content: string | null;
            videoUrl: string | null;
            order: number;
            courseId: string;
        }[];
    } & {
        id: string;
        title: string;
        description: string | null;
        level: string | null;
        isPublished: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    create(dto: CreateCourseDto): import("@prisma/client").Prisma.Prisma__CourseClient<{
        id: string;
        title: string;
        description: string | null;
        level: string | null;
        isPublished: boolean;
        createdAt: Date;
        updatedAt: Date;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    update(id: string, dto: UpdateCourseDto): Promise<{
        id: string;
        title: string;
        description: string | null;
        level: string | null;
        isPublished: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string): Promise<{
        id: string;
        title: string;
        description: string | null;
        level: string | null;
        isPublished: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
