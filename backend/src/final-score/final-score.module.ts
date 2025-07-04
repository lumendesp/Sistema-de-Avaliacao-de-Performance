import { Module } from '@nestjs/common';
import { FinalScoreController } from './final-score.controller';
import { FinalScoreService } from './final-score.service';
import { EvaluationCycleModule } from '../evaluation-cycle/evaluation-cycle.module';
import { PrismaModule } from '../prisma.module';

@Module({
  imports: [EvaluationCycleModule, PrismaModule],
  controllers: [FinalScoreController],
  providers: [FinalScoreService],
  exports: [FinalScoreService],
})
export class FinalScoreModule {} 