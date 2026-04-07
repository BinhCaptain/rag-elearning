import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLessonDto, UpdateLessonDto } from './dto/lesson.dto';

@Injectable()
export class LessonsService {
  constructor(private readonly prisma: PrismaService) {}

  findByCourse(courseId: string) {
    return this.prisma.lesson.findMany({
      where: { courseId },
      orderBy: { order: 'asc' },
    });
  }

  async findOne(id: string, userId?: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id },
      include: { 
        quizzes: { select: { id: true } },
        progress: userId ? { where: { userId } } : undefined,
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
    
    if (!lesson) throw new NotFoundException(`Lesson #${id} not found`);

    const courseLessons = lesson.course.lessons;
    const currentIndex = courseLessons.findIndex((l) => l.id === id);
    
    const prevLessonId = currentIndex > 0 ? courseLessons[currentIndex - 1].id : null;
    const nextLessonId = currentIndex < courseLessons.length - 1 ? courseLessons[currentIndex + 1].id : null;

    const isCompleted = lesson.progress ? lesson.progress.length > 0 && lesson.progress[0].status === 'COMPLETED' : false;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { course, progress, ...lessonData } = lesson;
    return {
      ...lessonData,
      prevLessonId,
      nextLessonId,
      isCompleted,
    };
  }

  async toggleProgress(lessonId: string, userId: string) {
    const progress = await this.prisma.progress.findUnique({
      where: {
        userId_lessonId: { userId, lessonId }
      }
    });

    if (progress && progress.status === 'COMPLETED') {
      return this.prisma.progress.update({
        where: { id: progress.id },
        data: { status: 'IN_PROGRESS', completedAt: null }
      });
    }

    return this.prisma.progress.upsert({
      where: {
        userId_lessonId: { userId, lessonId }
      },
      create: {
        userId,
        lessonId,
        status: 'COMPLETED',
        completedAt: new Date(),
      },
      update: {
        status: 'COMPLETED',
        completedAt: new Date(),
      }
    });
  }

  async create(dto: CreateLessonDto) {
    const { quiz, ...lessonData } = dto;
    
    return this.prisma.lesson.create({
      data: {
        ...lessonData,
        quizzes: quiz ? {
          create: {
            title: quiz.title,
            questions: {
              create: quiz.questions.map((q) => ({
                content: q.content,
                explanation: q.explanation,
                options: {
                  create: q.options,
                },
              })),
            },
          },
        } : undefined,
      },
    });
  }

  async update(id: string, dto: UpdateLessonDto) {
    const { quiz, ...lessonData } = dto;
    await this.findOne(id);

    // If quiz is provided, we'll replace the existing ones for simplicity
    // or handle specific update logic. Here we replace for "sync" behavior.
    if (quiz) {
      await this.prisma.quiz.deleteMany({ where: { lessonId: id } });
    }

    return this.prisma.lesson.update({
      where: { id },
      data: {
        ...lessonData,
        quizzes: quiz ? {
          create: {
            title: quiz.title,
            questions: {
              create: quiz.questions.map((q) => ({
                content: q.content,
                explanation: q.explanation,
                options: {
                  create: q.options,
                },
              })),
            },
          },
        } : undefined,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.lesson.delete({ where: { id } });
  }
}
