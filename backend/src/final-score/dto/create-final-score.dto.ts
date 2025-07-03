import { IsInt, IsNumber, IsString, IsOptional, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFinalScoreDto {
  @ApiProperty({ example: 1, description: 'ID of the user being evaluated' })
  @IsInt()
  userId: number;

  @ApiProperty({ 
    example: 4.2, 
    description: 'Execution score (0-5)',
    required: false 
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5)
  executionScore?: number;

  @ApiProperty({ 
    example: 4.5, 
    description: 'Posture score (0-5)',
    required: false 
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5)
  postureScore?: number;

  @ApiProperty({ 
    example: 4.3, 
    description: 'Final consolidated score (0-5)',
    required: false 
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5)
  finalScore?: number;

  @ApiProperty({ 
    example: 'Excelente desempenho durante o ciclo...', 
    description: 'Summary text for the user',
    required: false 
  })
  @IsOptional()
  @IsString()
  summary?: string;

  @ApiProperty({ 
    example: 'Justificativa detalhada da nota final...', 
    description: 'Justification for the final score' 
  })
  @IsString()
  justification: string;
} 