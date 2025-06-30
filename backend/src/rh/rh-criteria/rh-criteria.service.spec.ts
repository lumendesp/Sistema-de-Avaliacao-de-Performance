import { Test, TestingModule } from '@nestjs/testing';
import { RhCriteriaService } from './rh-criteria.service';

describe('RhCriteriaService', () => {
  let service: RhCriteriaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RhCriteriaService],
    }).compile();

    service = module.get<RhCriteriaService>(RhCriteriaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
