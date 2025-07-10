import { IsInt, IsNotEmpty, Min, Max, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMentorEvaluationDto {
  @ApiProperty({ example: 2, description: 'ID do mentor avaliado' })
  @IsInt()
  @IsNotEmpty()
  evaluateeId: number;

  @ApiProperty({ example: 4, description: 'Nota de 1 a 5' })
  @IsInt()
  @Min(1)
  @Max(5)
  score: number;

  @ApiProperty({
    example: 'Excelente orientação durante o ciclo.',
    description: 'Justificativa da nota',
  })
  @IsString()
  @IsNotEmpty()
  justification: string;
}
