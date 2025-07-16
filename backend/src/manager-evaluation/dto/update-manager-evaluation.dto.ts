import { PartialType } from '@nestjs/mapped-types';
import { CreateManagerEvaluationDto } from './create-manager-evaluation.dto';

import { IsOptional, IsString } from 'class-validator';

export class UpdateManagerEvaluationDto extends PartialType(
  CreateManagerEvaluationDto,
) {
  @IsOptional()
  @IsString()
  status?: string;
}
