import { IsInt, IsArray, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class ManagerEvaluationItemDto {
  @ApiProperty({ example: 1, description: 'ID of the criterion' })
  @IsInt()
  criterionId: number;

  @ApiProperty({ example: 4, description: 'Score from 1 to 5' })
  @IsInt()
  score: number;

  @ApiProperty({ example: 'Excelente desempenho neste critério...' })
  justification: string;
}

export class CreateManagerEvaluationDto {
  @ApiProperty({ example: 2, description: 'ID of the user being evaluated' })
  @IsInt()
  evaluateeId: number;

  @ApiProperty({
    type: [ManagerEvaluationItemDto],
    description: 'Array of evaluation items',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ManagerEvaluationItemDto)
  @ArrayMinSize(1)
  items: ManagerEvaluationItemDto[];
} 