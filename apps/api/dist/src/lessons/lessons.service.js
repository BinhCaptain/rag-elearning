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
exports.LessonsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let LessonsService = class LessonsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    findByCourse(courseId) {
        return this.prisma.lesson.findMany({
            where: { courseId },
            orderBy: { order: 'asc' },
        });
    }
    async findOne(id) {
        const lesson = await this.prisma.lesson.findUnique({
            where: { id },
            include: {
                quizzes: { select: { id: true } },
                course: {
                    include: {
                        lessons: {
                            orderBy: { order: 'asc' },
                            select: { id: true },
                        },
                    },
                },
            },
        });
        if (!lesson)
            throw new common_1.NotFoundException(`Lesson #${id} not found`);
        const courseLessons = lesson.course.lessons;
        const currentIndex = courseLessons.findIndex((l) => l.id === id);
        const prevLessonId = currentIndex > 0 ? courseLessons[currentIndex - 1].id : null;
        const nextLessonId = currentIndex < courseLessons.length - 1 ? courseLessons[currentIndex + 1].id : null;
        const { course, ...lessonData } = lesson;
        return {
            ...lessonData,
            prevLessonId,
            nextLessonId,
        };
    }
    create(dto) {
        return this.prisma.lesson.create({ data: dto });
    }
    async update(id, dto) {
        await this.findOne(id);
        return this.prisma.lesson.update({ where: { id }, data: dto });
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.lesson.delete({ where: { id } });
    }
};
exports.LessonsService = LessonsService;
exports.LessonsService = LessonsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LessonsService);
//# sourceMappingURL=lessons.service.js.map