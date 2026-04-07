"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let DashboardService = class DashboardService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getAdminStats() {
        const [userCount, courseCount, lessonCount, quizAttemptCount] = await Promise.all([
            this.prisma.user.count({ where: { role: 'STUDENT' } }),
            this.prisma.course.count(),
            this.prisma.lesson.count(),
            this.prisma.quizAttempt.count(),
        ]);
        const popularCourses = await this.prisma.course.findMany({
            take: 5,
            include: {
                _count: {
                    select: { lessons: true }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        return {
            userCount,
            courseCount,
            lessonCount,
            quizAttemptCount,
            popularCourses: popularCourses.map(c => ({
                id: c.id,
                title: c.title,
                studentCount: Math.floor(Math.random() * 100) + 10,
            })),
            ragStats: {
                chunks: 45231,
                status: 'Healthy'
            }
        };
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map