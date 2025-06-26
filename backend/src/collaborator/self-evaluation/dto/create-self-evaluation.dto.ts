import { IsInt, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CreateSelfEvaluationItemDto } from './create-self-evaluation-item.dto';

export class CreateSelfEvaluationDto {
  @ApiProperty({ example: 1, description: 'ID do ciclo de avaliação' })
  @IsInt()
  cycleId: number;

  @ApiProperty({
    type: [CreateSelfEvaluationItemDto],
    description: 'Lista de critérios avaliados',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSelfEvaluationItemDto)
  items: CreateSelfEvaluationItemDto[];
}
