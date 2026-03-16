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
exports.QuizzesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let QuizzesService = class QuizzesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findByLesson(lessonId) {
        return this.prisma.quiz.findMany({
            where: { lessonId },
            include: {
                questions: {
                    include: {
                        options: true,
                    },
                },
            },
        });
    }
    async findOne(id) {
        const quiz = await this.prisma.quiz.findUnique({
            where: { id },
            include: {
                questions: {
                    include: {
                        options: true,
                    },
                },
            },
        });
        if (!quiz)
            throw new common_1.NotFoundException(`Quiz #${id} not found`);
        return quiz;
    }
    async create(dto) {
        const { questions, ...quizData } = dto;
        return this.prisma.quiz.create({
            data: {
                ...quizData,
                questions: {
                    create: questions.map((q) => ({
                        content: q.content,
                        explanation: q.explanation,
                        options: {
                            create: q.options,
                        },
                    })),
                },
            },
            include: {
                questions: {
                    include: {
                        options: true,
                    },
                },
            },
        });
    }
    async submitAttempt(userId, quizId, dto) {
        const quiz = await this.findOne(quizId);
        let score = 0;
        const totalQuestions = quiz.questions.length;
        quiz.questions.forEach((question, index) => {
            const correctOption = question.options.find(o => o.isCorrect);
            if (correctOption && dto.answers[index] === correctOption.id) {
                score++;
            }
        });
        return this.prisma.quizAttempt.create({
            data: {
                userId,
                quizId,
                score,
                totalQuestions,
            },
        });
    }
};
exports.QuizzesService = QuizzesService;
exports.QuizzesService = QuizzesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], QuizzesService);
//# sourceMappingURL=quizzes.service.js.map