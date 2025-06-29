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
}

export class ManagerEvaluationGroupDto {
  @IsInt()
  groupId: number;

  @IsString()
  @IsOptional()
  groupName?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ManagerEvaluationItemDto)
  items: ManagerEvaluationItemDto[];
}

export class CreateManagerEvaluationDto {
  @IsInt()
  evaluateeId: number;

  @IsInt()
  cycleId: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ManagerEvaluationGroupDto)
  groups: ManagerEvaluationGroupDto[];
}
