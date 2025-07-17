import { Module } from '@nestjs/common';
import { RhCriteriaModule } from './rh-criteria/rh-criteria.module';
import { CriterionGroupModule } from './criterion-group/criterion-group.module';

@Module({
  imports: [
    RhCriteriaModule,
    CriterionGroupModule,
  ],
})
export class RhModule {}