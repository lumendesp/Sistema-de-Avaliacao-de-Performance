import { PartialType } from '@nestjs/mapped-types';
import { CreateCicloDto } from './create-ciclo.dto';

export class UpdateCicloDto extends PartialType(CreateCicloDto) {}
