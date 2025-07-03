import { PartialType } from '@nestjs/mapped-types';
import { CreateManagerEvaluationDto } from './create-manager-evaluation.dto';

export class UpdateManagerEvaluationDto extends PartialType(CreateManagerEvaluationDto) {}
