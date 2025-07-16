import { Test, TestingModule } from '@nestjs/testing';
import { RhService } from './rh.service';

describe('RhService', () => {
  let service: RhService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RhService],
    }).compile();

    service = module.get<RhService>(RhService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
