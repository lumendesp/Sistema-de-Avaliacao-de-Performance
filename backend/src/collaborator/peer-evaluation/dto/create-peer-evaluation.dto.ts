import {
  IsInt,
  IsString,
  IsEnum,
  Min,
  Max,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { MotivationLevel } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

class EvaluationProjectDto {
  @ApiProperty({ example: 'Project Apollo' })
  @IsString()
  name: string;

  @ApiProperty({ example: 6, description: 'Duração em meses' })
  @IsInt()
  @Min(0)
  period: number;
}

export class CreatePeerEvaluationDto {
  @ApiProperty({ example: 2 })
  @IsInt()
  evaluateeId: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  cycleId: number;

  @ApiProperty({
    example: 'Ótima colaboração com a equipe e bom desempenho técnico.',
  })
  @IsString()
  strengths: string;

  @ApiProperty({
    example: 'Pode melhorar a comunicação em reuniões de time.',
  })
  @IsString()
  improvements: string;

  @ApiProperty({
    enum: MotivationLevel,
    example: MotivationLevel.CONCORDO_TOTALMENTE,
  })
  @IsEnum(MotivationLevel)
  motivation: MotivationLevel;

  @ApiProperty({ example: 4, description: 'Nota de 1 a 5' })
  @IsInt()
  @Min(1)
  @Max(5)
  score: number;

  @ApiProperty({
    type: [EvaluationProjectDto],
    example: [{ name: 'Project Apollo', period: 6 }],
  })
  @ValidateNested({ each: true })
  @Type(() => EvaluationProjectDto)
  @ArrayMinSize(1)
  projects: EvaluationProjectDto[];
}
