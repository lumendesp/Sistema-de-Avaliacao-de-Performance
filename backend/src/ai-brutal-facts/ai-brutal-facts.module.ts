import { Module } from '@nestjs/common';
import { AiBrutalFactsService } from './ai-brutal-facts.service';
import { AiBrutalFactsController } from './ai-brutal-facts.controller';
import { GeminiService } from '../ai/ai.service';

@Module({
  controllers: [AiBrutalFactsController],
  providers: [AiBrutalFactsService, GeminiService],
  exports: [AiBrutalFactsService],
})
export class AiBrutalFactsModule {} 