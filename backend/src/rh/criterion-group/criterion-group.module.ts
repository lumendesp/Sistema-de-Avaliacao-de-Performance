import { Module } from '@nestjs/common';
import { CriterionGroupController } from './criterion-group.controller';
import { CriterionGroupService } from './criterion-group.service';
import { PrismaModule } from '../../prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CriterionGroupController],
  providers: [CriterionGroupService],
})
export class CriterionGroupModule {} 