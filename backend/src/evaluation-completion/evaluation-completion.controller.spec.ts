import { Test, TestingModule } from '@nestjs/testing';
import { EvaluationCompletionController } from './evaluation-completion.controller';
import { EvaluationCompletionService } from './evaluation-completion.service';

describe('EvaluationCompletionController', () => {
  let controller: EvaluationCompletionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EvaluationCompletionController],
      providers: [EvaluationCompletionService],
    }).compile();

    controller = module.get<EvaluationCompletionController>(EvaluationCompletionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
