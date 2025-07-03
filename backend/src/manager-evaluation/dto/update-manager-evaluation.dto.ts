import { IsArray, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { ManagerEvaluationItemDto } from './create-manager-evaluation.dto';

export class UpdateManagerEvaluationDto {
  @ApiProperty({
    type: [ManagerEvaluationItemDto],
    description: 'Array of evaluation items',
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ManagerEvaluationItemDto)
  items?: ManagerEvaluationItemDto[];
} 