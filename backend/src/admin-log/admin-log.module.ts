import { Module } from '@nestjs/common';
import { AdminLogController } from './admin-log.controller';
import { AdminLogService } from './admin-log.service';
import { PrismaModule } from '../prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [AdminLogController],
  providers: [AdminLogService],
  exports: [AdminLogService],
})
export class AdminLogModule {} 