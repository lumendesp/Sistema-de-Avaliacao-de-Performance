import {
  IsInt,
  IsArray,
  ValidateNested,
  IsOptional,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
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
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSelfEvaluationItemDto)
  items?: CreateSelfEvaluationItemDto[];

  @ApiProperty({
    example: 3.7,
    required: false,
    description: 'Média das notas da autoavaliação',
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  averageScore?: number;
}
