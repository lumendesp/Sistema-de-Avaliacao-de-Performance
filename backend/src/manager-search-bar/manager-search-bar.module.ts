import { Module } from '@nestjs/common';
import { ManagerSearchBarService } from './manager-search-bar.service';
import { ManagerSearchBarController } from './manager-search-bar.controller';
import { PrismaModule } from '../prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ManagerSearchBarController],
  providers: [ManagerSearchBarService],
})
export class ManagerSearchBarModule {}
