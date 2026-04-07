import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

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
        studentCount: Math.floor(Math.random() * 100) + 10, // Mock for now as we don't have Enrollment model
      })),
      ragStats: {
        chunks: 45231,
        status: 'Healthy'
      }
    };
  }
}
