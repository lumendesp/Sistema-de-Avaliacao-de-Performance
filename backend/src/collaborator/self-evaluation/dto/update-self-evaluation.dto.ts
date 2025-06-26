import { PartialType } from '@nestjs/swagger';
import { CreateSelfEvaluationDto } from './create-self-evaluation.dto';

export class UpdateSelfEvaluationDto extends PartialType(CreateSelfEvaluationDto) {}
