import { Test, TestingModule } from '@nestjs/testing';
import { ReferenceController } from './reference.controller';
import { ReferenceService } from './reference.service';

describe('ReferenceController', () => {
  let controller: ReferenceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReferenceController],
      providers: [ReferenceService],
    }).compile();

    controller = module.get<ReferenceController>(ReferenceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
