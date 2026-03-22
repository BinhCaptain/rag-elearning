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

  async findOne(id: string) {
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
    
    if (!lesson) throw new NotFoundException(`Lesson #${id} not found`);

    const courseLessons = lesson.course.lessons;
    const currentIndex = courseLessons.findIndex((l) => l.id === id);
    
    const prevLessonId = currentIndex > 0 ? courseLessons[currentIndex - 1].id : null;
    const nextLessonId = currentIndex < courseLessons.length - 1 ? courseLessons[currentIndex + 1].id : null;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { course, ...lessonData } = lesson;
    return {
      ...lessonData,
      prevLessonId,
      nextLessonId,
    };
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
