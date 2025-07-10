import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { AiSummaryService } from './ai-summary.service';
import { CreateSummaryDto } from './dto/create-summary.dto';

@Controller('ai-summary')
export class AiSummaryController {
  constructor(private readonly aiSummaryService: AiSummaryService) {}

  @Post()
  generateSummary(@Body() dto: CreateSummaryDto) {
    return this.aiSummaryService.generateSummary(dto);
  }

  @Post('lean')
  generateLeanSummary(@Body() dto: CreateSummaryDto) {
    return this.aiSummaryService.generateLeanSummary(dto);
  }

  @Get()
  getSummary(
    @Query('userId') userId: string,
    @Query('cycleId') cycleId: string,
  ) {
    return this.aiSummaryService.getSummary(Number(userId), Number(cycleId));
  }
}
