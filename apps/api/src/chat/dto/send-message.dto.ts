import { IsOptional, IsString, IsNotEmpty } from 'class-validator';

export class SendMessageDto {
  @IsOptional()
  @IsString()
  sessionId?: string;

  @IsNotEmpty()
  @IsString()
  message: string;

  @IsOptional()
  @IsString()
  lessonId?: string;
}
