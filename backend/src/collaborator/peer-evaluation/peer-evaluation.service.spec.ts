import { Test, TestingModule } from '@nestjs/testing';
import { PeerEvaluationService } from './peer-evaluation.service';

describe('PeerEvaluationService', () => {
  let service: PeerEvaluationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PeerEvaluationService],
    }).compile();

    service = module.get<PeerEvaluationService>(PeerEvaluationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
