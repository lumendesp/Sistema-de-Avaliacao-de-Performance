import { PartialType } from '@nestjs/swagger';
import { CreateFinalScoreDto } from './create-final-score.dto';

export class UpdateFinalScoreDto extends PartialType(CreateFinalScoreDto) {}
