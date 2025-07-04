import { Test, TestingModule } from '@nestjs/testing';
import { AiSummaryService } from './ai-summary.service';

describe('AiSummaryService', () => {
  let service: AiSummaryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AiSummaryService],
    }).compile();

    service = module.get<AiSummaryService>(AiSummaryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
