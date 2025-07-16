import { Test, TestingModule } from '@nestjs/testing';
import { AiClimateSummaryService } from './ai-climate-summary.service';

describe('AiClimateSummaryService', () => {
  let service: AiClimateSummaryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AiClimateSummaryService],
    }).compile();

    service = module.get<AiClimateSummaryService>(AiClimateSummaryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
