import { Module } from '@nestjs/common';
import { CollaboratorService } from './collaborator.service';
import { CollaboratorController } from './collaborator.controller';

@Module({
  controllers: [CollaboratorController],
  providers: [CollaboratorService],
})
export class CollaboratorModule {}
