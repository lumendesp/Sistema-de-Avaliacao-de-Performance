import {
  IsInt,
  IsNotEmpty,
  Min,
  Max,
  IsString,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateMentorEvaluationDto {
  @ApiProperty({ example: 4, description: 'Nota de 1 a 5' })
  @IsInt()
  @Min(1)
  @Max(5)
  @IsOptional()
  score?: number;
  
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  justification?: string;
}
