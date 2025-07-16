import {
  IsString,
  IsOptional,
  ValidateNested,
  IsArray,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';

class CreateQuestionDto {
  @IsString()
  text: string;
}

export class CreateClimateSurveyDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDateString()
  endDate: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuestionDto)
  questions: CreateQuestionDto[];
}
