import { Controller, Post, Body } from '@nestjs/common';
import { AiSummaryService } from './ai-summary.service';
import { CreateSummaryDto } from './dto/create-summary.dto';

@Controller('ai-summary')
export class AiSummaryController {
  constructor(private readonly aiSummaryService: AiSummaryService) {}

  @Post()
  generateSummary(@Body() dto: CreateSummaryDto) {
    return this.aiSummaryService.generateSummary(dto);
  }
}
