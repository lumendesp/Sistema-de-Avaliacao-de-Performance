import {
  IsInt,
  IsNotEmpty,
  Min,
  Max,
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class ProjectDto {
  @ApiProperty({ example: 'Projeto X', description: 'Nome do projeto' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 6, description: 'Período em meses' })
  @IsInt()
  @Min(1)
  period: number;
}

export class UpdatePeerEvaluationDto {
  @ApiProperty({ example: 4, description: 'Nota de 1 a 5' })
  @IsInt()
  @Min(1)
  @Max(5)
  @IsOptional()
  score?: number;

  @ApiProperty({
    example: 'Excelente trabalho em equipe e comunicação.',
    description: 'Pontos fortes do colaborador',
  })
  @IsString()
  @IsOptional()
  strengths?: string;

  @ApiProperty({
    example: 'Pode melhorar na gestão de tempo.',
    description: 'Pontos de melhoria do colaborador',
  })
  @IsString()
  @IsOptional()
  improvements?: string;

  @ApiProperty({
    example: 'CONCORDO_TOTALMENTE',
    description: 'Motivação para trabalhar novamente',
    enum: [
      'CONCORDO_TOTALMENTE',
      'CONCORDO_PARCIALMENTE',
      'DISCORDO_PARCIALMENTE',
      'DISCORDO_TOTALMENTE',
    ],
  })
  @IsString()
  @IsOptional()
  motivation?: string;

  @ApiProperty({
    type: [ProjectDto],
    description: 'Projetos em que trabalharam juntos',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProjectDto)
  @IsOptional()
  projects?: ProjectDto[];
}
