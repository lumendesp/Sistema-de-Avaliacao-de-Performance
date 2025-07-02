import { Controller } from '@nestjs/common';
import { AiSummaryService } from './ai-summary.service';

@Controller('ai-summary')
export class AiSummaryController {
  constructor(private readonly aiSummaryService: AiSummaryService) {}
}
