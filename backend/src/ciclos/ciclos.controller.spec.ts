import { Test, TestingModule } from '@nestjs/testing';
import { CiclosController } from './ciclos.controller';
import { CiclosService } from './ciclos.service';

describe('CiclosController', () => {
  let controller: CiclosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CiclosController],
      providers: [CiclosService],
    }).compile();

    controller = module.get<CiclosController>(CiclosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
