import { Test, TestingModule } from '@nestjs/testing';
import { EvaluationCompletionService } from './evaluation-completion.service';

describe('EvaluationCompletionService', () => {
  let service: EvaluationCompletionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EvaluationCompletionService],
    }).compile();

    service = module.get<EvaluationCompletionService>(EvaluationCompletionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
