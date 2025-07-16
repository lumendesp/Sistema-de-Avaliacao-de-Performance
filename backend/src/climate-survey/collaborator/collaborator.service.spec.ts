import { Test, TestingModule } from '@nestjs/testing';
import { CollaboratorService } from './collaborator.service';

describe('CollaboratorService', () => {
  let service: CollaboratorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CollaboratorService],
    }).compile();

    service = module.get<CollaboratorService>(CollaboratorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
