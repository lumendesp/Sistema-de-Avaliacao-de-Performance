import { IsOptional, IsString, IsDateString, IsNumber, IsEnum } from 'class-validator';
import { OKRStatus } from '@prisma/client';

export class UpdateOkrDto {
  @IsOptional()
  @IsString()
  objective?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsNumber()
  progress?: number;

  @IsOptional()
  @IsEnum(OKRStatus)
  status?: OKRStatus;
} 