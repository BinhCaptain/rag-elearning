import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQuizDto, SubmitQuizDto } from './dto/quiz.dto';

@Injectable()
export class QuizzesService {
  constructor(private readonly prisma: PrismaService) {}

  async findByLesson(lessonId: string) {
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

  async findOne(id: string) {
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
    if (!quiz) throw new NotFoundException(`Quiz #${id} not found`);
    return quiz;
  }

  async create(dto: CreateQuizDto) {
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

  async submitAttempt(userId: string, quizId: string, dto: SubmitQuizDto) {
    const quiz = await this.findOne(quizId);
    let score = 0;

    const totalQuestions = quiz.questions.length;
    
    // Simple grading logic
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
}
