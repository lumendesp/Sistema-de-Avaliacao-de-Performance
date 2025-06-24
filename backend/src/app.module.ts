import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { CommitteeController } from './committee.controller';
import { CommitteeService } from './committee.service';

import { CollaboratorModule } from './collaborator/collaborator.module';

@Module({
  imports: [CollaboratorModule],
  controllers: [AppController, CommitteeController],
  providers: [AppService, PrismaService, CommitteeService],
})
export class AppModule {}
