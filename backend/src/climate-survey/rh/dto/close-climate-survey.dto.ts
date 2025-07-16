import { IsOptional, IsDateString } from 'class-validator';

export class CloseSurveyDto {
  @IsOptional()
  @IsDateString()
  endDate?: string; 
}
