import { Test, TestingModule } from '@nestjs/testing';
import { PeerEvaluationController } from './peer-evaluation.controller';
import { PeerEvaluationService } from './peer-evaluation.service';

describe('PeerEvaluationController', () => {
  let controller: PeerEvaluationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PeerEvaluationController],
      providers: [PeerEvaluationService],
    }).compile();

    controller = module.get<PeerEvaluationController>(PeerEvaluationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
