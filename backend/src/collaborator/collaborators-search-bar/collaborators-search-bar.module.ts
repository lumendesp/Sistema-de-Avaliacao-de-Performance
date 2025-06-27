import { Module } from '@nestjs/common';
import { CollaboratorsSearchBarService } from './collaborators-search-bar.service';
import { CollaboratorsSearchBarController } from './collaborators-search-bar.controller';
import { PrismaModule } from '../../prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CollaboratorsSearchBarController],
  providers: [CollaboratorsSearchBarService],
})
export class CollaboratorsSearchBarModule {}
