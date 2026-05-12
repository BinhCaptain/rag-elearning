import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EnrollmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async enroll(userId: string, courseId: string) {
    // Check if course exists
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });
    if (!course) {
      throw new NotFoundException('Khóa học không tồn tại');
    }

    // Check if already enrolled
    const existing = await this.prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });

    if (existing) {
      throw new ConflictException('Bạn đã đăng ký khóa học này rồi');
    }

    return this.prisma.enrollment.create({
      data: {
        userId,
        courseId,
      },
      include: {
        course: true,
      },
    });
  }

  async checkStatus(userId: string, courseId: string) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: {
        userId_courseId: { userId, courseId },
      },
    });

    if (!enrollment) return { enrolled: false, progress: 0 };

    const totalLessons = await this.prisma.lesson.count({
      where: { courseId },
    });

    if (totalLessons === 0) return { enrolled: true, progress: 0 };

    const completedProgress = await this.prisma.progress.count({
      where: {
        userId,
        lesson: { courseId },
        status: 'COMPLETED',
      },
    });

    const progress = Math.round((completedProgress / totalLessons) * 100);
    return { enrolled: true, progress };
  }

  async getEnrolledUsersByCourse(courseId: string) {
    return this.prisma.enrollment.findMany({
      where: { courseId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            role: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async unenroll(userId: string, courseId: string): Promise<void> {
    await this.prisma.enrollment.deleteMany({
      where: { userId, courseId },
    });
  }
}
