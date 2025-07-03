import { Test, TestingModule } from '@nestjs/testing';
import { MentorEvaluationService } from './mentor-evaluation.service';

describe('MentorEvaluationService', () => {
  let service: MentorEvaluationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MentorEvaluationService],
    }).compile();

    service = module.get<MentorEvaluationService>(MentorEvaluationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
