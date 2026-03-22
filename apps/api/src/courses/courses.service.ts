import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCourseDto, UpdateCourseDto } from './dto/course.dto';

@Injectable()
export class CoursesService {
  constructor(private readonly prisma: PrismaService) {}

  // Public: list all published courses
  findAll(isAdmin = false) {
    return this.prisma.course.findMany({
      where: isAdmin ? {} : { isPublished: true },
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { lessons: true } } },
    });
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
