import { Test, TestingModule } from '@nestjs/testing';
import { EvaluationCycleService } from './evaluation-cycle.service';

describe('EvaluationCycleService', () => {
  let service: EvaluationCycleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EvaluationCycleService],
    }).compile();

    service = module.get<EvaluationCycleService>(EvaluationCycleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
