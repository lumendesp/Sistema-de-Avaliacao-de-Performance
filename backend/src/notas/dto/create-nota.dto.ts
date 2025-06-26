import { IsInt, IsOptional, IsNumber, IsString } from 'class-validator';

export class CreateNotaDto {
  @IsInt()
  userId: number;

  @IsInt()
  cycleId: number;

  @IsOptional()
  @IsNumber()
  executionScore?: number;

  @IsOptional()
  @IsNumber()
  postureScore?: number;

  @IsOptional()
  @IsNumber()
  finalScore?: number;

  @IsOptional()
  @IsString()
  summary?: string;

  @IsOptional()
  @IsInt()
  adjustedBy?: number;

  @IsString()
  justification: string;
}
