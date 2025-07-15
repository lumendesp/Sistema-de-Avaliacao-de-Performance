import { Test, TestingModule } from '@nestjs/testing';
import { FinalScoreService } from './final-score.service';

describe('FinalScoreService', () => {
  let service: FinalScoreService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FinalScoreService],
    }).compile();

    service = module.get<FinalScoreService>(FinalScoreService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
