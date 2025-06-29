import { Test, TestingModule } from '@nestjs/testing';
import { RhCriteriaController } from './rh-criteria.controller';

describe('RhCriteriaController', () => {
  let controller: RhCriteriaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RhCriteriaController],
    }).compile();

    controller = module.get<RhCriteriaController>(RhCriteriaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
