import { IsInt, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSelfEvaluationItemDto {
  @ApiProperty({ example: 1, description: 'ID do critério' })
  @IsInt()
  criterionId: number;

  @ApiProperty({ example: 4, description: 'Nota de 1 a 5' })
  @IsInt()
  score: number;

  @ApiProperty({ example: 'Fui resiliente em situações difíceis' })
  @IsString()
  justification: string;

  @ApiProperty({ example: 'Desempenho consistente', required: false })
  @IsOptional()
  @IsString()
  scoreDescription?: string;
}
