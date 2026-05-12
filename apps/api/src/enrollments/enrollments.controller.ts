import { Controller, Post, Get, Delete, Param, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { EnrollmentsService } from './enrollments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

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
    return this.enrollmentsService.checkStatus(req.user.id, courseId);
  }

  @Get('admin/course/:courseId')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  async getEnrolledUsers(@Param('courseId') courseId: string) {
    return this.enrollmentsService.getEnrolledUsersByCourse(courseId);
  }

  @Delete('admin/:userId/:courseId')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  async unenrollUser(
    @Param('userId') userId: string,
    @Param('courseId') courseId: string,
  ) {
    await this.enrollmentsService.unenroll(userId, courseId);
  }
}
