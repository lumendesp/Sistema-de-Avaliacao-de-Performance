import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma.module';
import { GeminiService } from 'src/ai/ai.service';
import { AiClimateSummaryService } from './ai-climate-summary.service';
import { AiClimateSummaryController } from './ai-climate-summary.controller';

@Module({
  imports: [PrismaModule],
  controllers: [AiClimateSummaryController],
  providers: [AiClimateSummaryService, GeminiService],
})
export class AiClimateSummaryModule {}
