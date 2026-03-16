import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { QuizzesService } from './quizzes.service';
import { CreateQuizDto, SubmitQuizDto } from './dto/quiz.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('quizzes')
export class QuizzesController {
  constructor(private readonly quizzesService: QuizzesService) {}

  @Get()
  findByLesson(@Query('lessonId') lessonId: string) {
    return this.quizzesService.findByLesson(lessonId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.quizzesService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateQuizDto) {
    return this.quizzesService.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/submit')
  submit(@Param('id') id: string, @Body() dto: SubmitQuizDto, @Request() req: any) {
    return this.quizzesService.submitAttempt(req.user.id, id, dto);
  }
}
