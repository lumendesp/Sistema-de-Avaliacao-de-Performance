import { Test, TestingModule } from '@nestjs/testing';
import { AiSummaryController } from './ai-summary.controller';
import { AiSummaryService } from './ai-summary.service';

describe('AiSummaryController', () => {
  let controller: AiSummaryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AiSummaryController],
      providers: [AiSummaryService],
    }).compile();

    controller = module.get<AiSummaryController>(AiSummaryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
