import { Module } from '@nestjs/common';
import { AiSummaryService } from './ai-summary.service';
import { AiSummaryController } from './ai-summary.controller';

@Module({
  controllers: [AiSummaryController],
  providers: [AiSummaryService],
})
export class AiSummaryModule {}
