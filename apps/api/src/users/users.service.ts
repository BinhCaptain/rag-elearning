import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findOneByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findOneById(id: string): Promise<Omit<User, 'passwordHash'> | null> {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
        passwordHash: false,
      },
    });
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({ data });
  }

  async findAll(): Promise<Omit<User, 'passwordHash'>[]> {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
        passwordHash: false,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async delete(id: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Người dùng không tồn tại');
    await this.prisma.user.delete({ where: { id } });
  }

  async update(id: string, data: Prisma.UserUpdateInput): Promise<Omit<User, 'passwordHash'>> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Người dùng không tồn tại');
    
    return this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
        passwordHash: false,
      },
    });
  }

  async updatePassword(id: string, newPasswordStr: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Người dùng không tồn tại');
    
    const passwordHash = await bcrypt.hash(newPasswordStr, 10);
    await this.prisma.user.update({
      where: { id },
      data: { passwordHash },
    });
  }

  async getUserProgress(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      }
    });

    if (!user) throw new NotFoundException('Người dùng không tồn tại');

    // 1. Lấy danh sách các khóa học đã đăng ký kèm tiến độ
    const enrollments = await this.prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            _count: { select: { lessons: true } },
            lessons: {
              select: {
                id: true,
                progress: {
                  where: { userId, status: 'COMPLETED' },
                  select: { id: true }
                }
              }
            }
          }
        }
      }
    });

    const courseProgress = enrollments.map(e => {
      const course = e.course;
      const totalLessons = course._count.lessons;
      const completedLessons = course.lessons.reduce((acc, lesson) => acc + (lesson.progress.length > 0 ? 1 : 0), 0);
      const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
      
      return {
        id: course.id,
        title: course.title,
        level: course.level,
        totalLessons,
        completedLessons,
        progressPercentage,
        enrolledAt: e.createdAt,
      };
    });

    // 2. Lấy danh sách điểm số quiz
    const quizAttempts = await this.prisma.quizAttempt.findMany({
      where: { userId },
      include: {
        quiz: {
          select: {
            title: true,
            lesson: {
              select: {
                title: true,
                course: {
                  select: {
                    title: true,
                  }
                }
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedQuizAttempts = quizAttempts.map(attempt => ({
      id: attempt.id,
      quizTitle: attempt.quiz.title,
      lessonTitle: attempt.quiz.lesson.title,
      courseTitle: attempt.quiz.lesson.course.title,
      score: attempt.score,
      totalQuestions: attempt.totalQuestions,
      createdAt: attempt.createdAt,
    }));

    return {
      user,
      courses: courseProgress,
      quizzes: formattedQuizAttempts,
    };
  }
}
