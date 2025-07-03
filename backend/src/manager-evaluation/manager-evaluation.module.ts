import { Module } from '@nestjs/common';
import { ManagerEvaluationController } from './manager-evaluation.controller';
import { ManagerEvaluationService } from './manager-evaluation.service';
import { EvaluationCycleModule } from '../evaluation-cycle/evaluation-cycle.module';
import { PrismaModule } from '../prisma.module';

@Module({
  imports: [EvaluationCycleModule, PrismaModule],
  controllers: [ManagerEvaluationController],
  providers: [ManagerEvaluationService],
  exports: [ManagerEvaluationService],
})
export class ManagerEvaluationModule {} 