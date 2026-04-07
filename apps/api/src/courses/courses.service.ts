import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCourseDto, UpdateCourseDto } from './dto/course.dto';

@Injectable()
export class CoursesService {
  constructor(private readonly prisma: PrismaService) {}

  // Public: list all published courses, with optional user progress
  async findAll(userId?: string, isAdmin = false, onlyEnrolled = false) {
    const where: any = isAdmin ? {} : { isPublished: true };
    
    if (userId && onlyEnrolled) {
      where.enrollments = {
        some: { userId },
      };
    }

    const courses = await this.prisma.course.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { 
        _count: { select: { lessons: true } },
        lessons: userId ? {
          select: {
            id: true,
            progress: {
              where: { userId, status: 'COMPLETED' },
              select: { id: true }
            }
          }
        } : false
      },
    });

    if (userId) {
      return courses.map(course => {
        const totalLessons = course._count.lessons;
        const completedLessons = course.lessons.reduce((acc, lesson: any) => acc + (lesson.progress.length > 0 ? 1 : 0), 0);
        const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
        
        // Remove the heavy lessons data from list view
        const { lessons, ...courseData } = course;
        return { ...courseData, progressPercentage };
      });
    }

    return courses;
  }

  async findOne(id: string) {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: {
        lessons: { 
          orderBy: { order: 'asc' },
          include: { quizzes: { select: { id: true } } },
        },
      },
    });
    if (!course) throw new NotFoundException(`Course #${id} not found`);
    return course;
  }

  create(dto: CreateCourseDto) {
    return this.prisma.course.create({ data: dto });
  }

  async update(id: string, dto: UpdateCourseDto) {
    await this.findOne(id); // throw if not found
    return this.prisma.course.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.course.delete({ where: { id } });
  }
}
