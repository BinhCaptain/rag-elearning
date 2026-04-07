import { DashboardService } from './dashboard.service';
export declare class DashboardController {
    private readonly dashboardService;
    constructor(dashboardService: DashboardService);
    getStats(): Promise<{
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
