import { PrismaService } from '../prisma/prisma.service';
export declare class DashboardService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getAdminStats(): Promise<{
        userCount: number;
        courseCount: number;
        lessonCount: number;
        quizAttemptCount: number;
        popularCourses: {
            id: string;
            title: string;
            studentCount: number;
        }[];
        ragStats: {
            chunks: number;
            status: string;
        };
    }>;
}
