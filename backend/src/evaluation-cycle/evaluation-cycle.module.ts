import { Module } from '@nestjs/common';
import { EvaluationCycleController } from './evaluation-cycle.controller';
import { EvaluationCycleService } from './evaluation-cycle.service';
import { PrismaModule } from '../prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [EvaluationCycleController],
  providers: [EvaluationCycleService],
  exports: [EvaluationCycleService],
})
export class EvaluationCycleModule {}
