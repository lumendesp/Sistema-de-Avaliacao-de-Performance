import { Module } from '@nestjs/common';
import { SelfEvaluationService } from './self-evaluation.service';
import { SelfEvaluationController } from './self-evaluation.controller';
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [SelfEvaluationController],
  providers: [SelfEvaluationService, PrismaService],
})
export class SelfEvaluationModule {}
