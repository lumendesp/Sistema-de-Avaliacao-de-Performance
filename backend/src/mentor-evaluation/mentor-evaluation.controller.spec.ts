import { Test, TestingModule } from '@nestjs/testing';
import { MentorEvaluationController } from './mentor-evaluation.controller';

describe('MentorEvaluationController', () => {
  let controller: MentorEvaluationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MentorEvaluationController],
    }).compile();

    controller = module.get<MentorEvaluationController>(MentorEvaluationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
