import { Test, TestingModule } from '@nestjs/testing';
import { RhController } from './rh.controller';
import { RhService } from './rh.service';

describe('RhController', () => {
  let controller: RhController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RhController],
      providers: [RhService],
    }).compile();

    controller = module.get<RhController>(RhController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
