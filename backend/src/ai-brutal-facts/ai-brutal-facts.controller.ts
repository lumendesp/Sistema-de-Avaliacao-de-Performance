import { Controller, Post, Body } from '@nestjs/common';
import { AiBrutalFactsService } from './ai-brutal-facts.service';
import { CreateAiBrutalFactDto } from './dto/create-ai-brutal-fact.dto';

@Controller('ai-brutal-facts')
export class AiBrutalFactsController {
  constructor(private readonly aiBrutalFactsService: AiBrutalFactsService) {}

  @Post()
  async getInsight(@Body() dto: CreateAiBrutalFactDto) {
    return {
      insight: await this.aiBrutalFactsService.getInsightForLastCompletedCycle(),
    };
  }
} 