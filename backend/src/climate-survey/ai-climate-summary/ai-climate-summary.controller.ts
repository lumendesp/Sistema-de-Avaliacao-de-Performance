import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { AiClimateSummaryService } from './ai-climate-summary.service';
import { CreateClimateSummaryDto } from './dto/create-climate-summary.dto';

@Controller('ai-climate-summary')
export class AiClimateSummaryController {
  constructor(
    private readonly aiClimateSummaryService: AiClimateSummaryService,
  ) {}

  @Post()
  async generateSummary(@Body() dto: CreateClimateSummaryDto) {
    const result = await this.aiClimateSummaryService.generateSummary(dto);
    return {
      text: result.text,
      shortText: result.shortText,
      satisfactionScore: result.satisfactionScore,
      status: result.status,
    };
  }

  @Get()
  async getSummary(@Query('surveyId') surveyId: string) {
    const result = await this.aiClimateSummaryService.getSummary(
      Number(surveyId),
    );
    return {
      text: result.text,
      shortText: result.shortText,
      satisfactionScore: result.satisfactionScore,
      status: result.status,
    };
  }

  @Get('all')
  async getAllSummaries() {
    return this.aiClimateSummaryService.getAllSummaries();
  }
}
