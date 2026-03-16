import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { CoursesModule } from './courses/courses.module';
import { LessonsModule } from './lessons/lessons.module';
import { QuizzesModule } from './quizzes/quizzes.module';

@Module({
  imports: [PrismaModule, UsersModule, AuthModule, CoursesModule, LessonsModule, QuizzesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
