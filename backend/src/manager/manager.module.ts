import { Module } from '@nestjs/common';
import { ManagerController } from './manager.controller';
import { ManagerService } from './manager.service';
import { PrismaModule } from '../prisma.module';
import { ManagerSearchBarModule } from '../manager-search-bar/manager-search-bar.module';

@Module({
  imports: [PrismaModule, ManagerSearchBarModule],
  controllers: [ManagerController],
  providers: [ManagerService],
  exports: [ManagerService],
})
export class ManagerModule {}
