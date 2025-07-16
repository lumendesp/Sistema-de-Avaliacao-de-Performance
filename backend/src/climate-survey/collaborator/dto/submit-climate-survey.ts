import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ClimateLevel } from '@prisma/client';

class ClimateSurveyAnswerInput {
  @IsNotEmpty()
  questionId: number;

  @IsEnum(ClimateLevel)
  level: ClimateLevel;

  @IsString()
  justification: string;
}

export class SubmitClimateSurveyDto {
  @IsString()
  hashId: string;

  @IsBoolean()
  isSubmit: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ClimateSurveyAnswerInput)
  answers: ClimateSurveyAnswerInput[];
}
