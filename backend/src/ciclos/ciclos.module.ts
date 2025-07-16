import { Module } from '@nestjs/common';
import { CiclosService } from './ciclos.service';
import { CiclosController } from './ciclos.controller';
import { GeminiService } from '../ai/ai.service';
import { AiBrutalFactsModule } from '../ai-brutal-facts/ai-brutal-facts.module';
import { CycleService } from './cycle.service';
import { CycleTransferService } from './cycle-transfer.service';
import { AiSummaryModule } from 'src/ai-summary/ai-summary.module';

@Module({
  controllers: [CiclosController],
  providers: [CiclosService, GeminiService, CycleService, CycleTransferService],
  imports: [AiBrutalFactsModule, AiSummaryModule],
  exports: [AiBrutalFactsModule],
})
export class CiclosModule {}
