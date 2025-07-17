import { PartialType } from '@nestjs/mapped-types';
import { CreateCriterionGroupDto } from './create-criterion-group.dto';
 
export class UpdateCriterionGroupDto extends PartialType(CreateCriterionGroupDto) {} 