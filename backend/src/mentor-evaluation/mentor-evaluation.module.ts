import { Module } from '@nestjs/common';
import { MentorEvaluationController } from './mentor-evaluation.controller';
import { MentorEvaluationService } from './mentor-evaluation.service';
import { EvaluationCycleModule } from '../evaluation-cycle/evaluation-cycle.module';
import { PrismaModule } from '../prisma.module';

@Module({
  imports: [EvaluationCycleModule, PrismaModule],
  controllers: [MentorEvaluationController],
  providers: [MentorEvaluationService],
})
export class MentorEvaluationModule {}
