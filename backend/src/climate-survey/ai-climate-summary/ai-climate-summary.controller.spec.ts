import { Test, TestingModule } from '@nestjs/testing';
import { AiClimateSummaryController } from './ai-climate-summary.controller';
import { AiClimateSummaryService } from './ai-climate-summary.service';

describe('AiClimateSummaryController', () => {
  let controller: AiClimateSummaryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AiClimateSummaryController],
      providers: [AiClimateSummaryService],
    }).compile();

    controller = module.get<AiClimateSummaryController>(AiClimateSummaryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
