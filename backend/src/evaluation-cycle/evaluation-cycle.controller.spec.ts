import { Test, TestingModule } from '@nestjs/testing';
import { EvaluationCycleController } from './evaluation-cycle.controller';

describe('EvaluationCycleController', () => {
  let controller: EvaluationCycleController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EvaluationCycleController],
    }).compile();

    controller = module.get<EvaluationCycleController>(EvaluationCycleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
