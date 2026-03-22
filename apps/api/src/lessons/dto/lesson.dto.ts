import { IsString, IsOptional, IsNumber, IsUrl, Min, IsArray, ValidateNested, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class NestedOptionDto {
  @IsString()
  content: string;

  @IsBoolean()
  @IsOptional()
  isCorrect?: boolean;
}

export class NestedQuestionDto {
  @IsString()
  content: string;

  @IsString()
  @IsOptional()
  explanation?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NestedOptionDto)
  options: NestedOptionDto[];
}

export class NestedQuizDto {
  @IsString()
  title: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NestedQuestionDto)
  questions: NestedQuestionDto[];
}

export class CreateLessonDto {
  @IsString()
  courseId: string;

  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsString()
  @IsOptional()
  videoUrl?: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  order?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => NestedQuizDto)
  quiz?: NestedQuizDto;
}

export class UpdateLessonDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsString()
  @IsOptional()
  videoUrl?: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  order?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => NestedQuizDto)
  quiz?: NestedQuizDto;
}
