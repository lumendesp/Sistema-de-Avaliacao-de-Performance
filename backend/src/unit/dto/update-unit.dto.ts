import { PartialType } from '@nestjs/mapped-types';
import { CreateUnitDto } from './create-unit.dto';

export class UpdateUnitDto extends PartialType(CreateUnitDto) {} 