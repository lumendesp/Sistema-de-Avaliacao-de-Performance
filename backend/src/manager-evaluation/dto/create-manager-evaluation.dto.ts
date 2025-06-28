import { IsInt, IsArray, ValidateNested, IsString, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class ManagerEvaluationItemDto {
  @IsInt()
  criterionId: number;

  @IsInt()
  score: number;

  @IsString()
  @IsOptional()
  justification?: string;

  @IsString()
  @IsOptional()
  group?: string; // Ex: 'postura', 'eticos', etc
}

export class CreateManagerEvaluationDto {
  @IsInt()
  evaluateeId: number;

  @IsInt()
  cycleId: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ManagerEvaluationItemDto)
  items: ManagerEvaluationItemDto[];
}
