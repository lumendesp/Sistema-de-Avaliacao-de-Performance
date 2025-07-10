import { Test, TestingModule } from '@nestjs/testing';
import { CiclosService } from './ciclos.service';

describe('CiclosService', () => {
  let service: CiclosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CiclosService],
    }).compile();

    service = module.get<CiclosService>(CiclosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
