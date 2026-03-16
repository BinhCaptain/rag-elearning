import { IsString, IsOptional, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateLessonDto {
  @IsString()
  courseId: string;

  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  content?: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  order?: number;
}

export class UpdateLessonDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  content?: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  order?: number;
}
