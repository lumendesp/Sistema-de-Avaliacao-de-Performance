import { IsInt, IsString, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSelfEvaluationItemDto {
  @ApiProperty({ example: 1, description: 'ID do critério' })
  @IsInt()
  criterionId: number;

  @ApiProperty({ example: 4, description: 'Nota de 1 a 5' })
  @IsInt()
  @Min(1)
  @Max(5)
  score: number;

  @ApiProperty({ example: 'Justificativa da nota' })
  @IsString()
  justification: string;
}
