import { IsInt, IsOptional, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFinalScoreDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  userId: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  cycleId: number;

  @ApiProperty({ example: 4.5, required: false })
  @IsOptional()
  @IsNumber()
  executionScore?: number;

  @ApiProperty({ example: 4.0, required: false })
  @IsOptional()
  @IsNumber()
  postureScore?: number;

  @ApiProperty({ example: 4.25, required: false })
  @IsOptional()
  @IsNumber()
  finalScore?: number;

  @ApiProperty({ example: 'Ótima performance no semestre', required: false })
  @IsOptional()
  @IsString()
  summary?: string;

  @ApiProperty({ example: 2, required: false })
  @IsOptional()
  @IsInt()
  adjustedBy?: number;

  @ApiProperty({ example: 'Justificativa detalhada da nota.' })
  @IsString()
  justification: string;
}
