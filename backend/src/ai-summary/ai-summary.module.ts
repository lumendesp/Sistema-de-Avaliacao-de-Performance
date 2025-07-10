import { Module } from '@nestjs/common';
import { AiSummaryService } from './ai-summary.service';
import { AiSummaryController } from './ai-summary.controller';
import { PrismaModule } from 'src/prisma.module';
import { GeminiService } from 'src/ai/ai.service';

@Module({
  imports: [PrismaModule],
  controllers: [AiSummaryController],
  providers: [AiSummaryService, GeminiService],
})
export class AiSummaryModule {}
