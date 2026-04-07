import { Controller, Post, Get, Param, UseGuards, Request } from '@nestjs/common';
import { EnrollmentsService } from './enrollments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('enrollments')
@UseGuards(JwtAuthGuard)
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Post(':courseId')
  async enroll(@Param('courseId') courseId: string, @Request() req: any) {
    return this.enrollmentsService.enroll(req.user.id, courseId);
  }

  @Get('check/:courseId')
  async check(@Param('courseId') courseId: string, @Request() req: any) {
    return { enrolled: await this.enrollmentsService.isEnrolled(req.user.id, courseId) };
  }
}
