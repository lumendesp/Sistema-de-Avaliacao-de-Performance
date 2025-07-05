import { Module } from '@nestjs/common';
import { PeerEvaluationService } from './peer-evaluation.service';
import { PeerEvaluationController } from './peer-evaluation.controller';
import { EvaluationCycleModule } from '../../evaluation-cycle/evaluation-cycle.module';
import { PrismaService } from '../../prisma.service';

@Module({
  imports: [EvaluationCycleModule],
  controllers: [PeerEvaluationController],
  providers: [PeerEvaluationService, PrismaService],
})
export class PeerEvaluationModule {}
