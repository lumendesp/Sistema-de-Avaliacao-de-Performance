import { Module } from '@nestjs/common';
import { EvaluationService } from './evaluation.service';
import { EvaluationController } from './evaluation.controller';
import { PrismaModule } from '../prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [EvaluationService],
  controllers: [EvaluationController],
  exports: [EvaluationService],
})
export class EvaluationModule {}
