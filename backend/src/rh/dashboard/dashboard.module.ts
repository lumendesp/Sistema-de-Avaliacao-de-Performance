import { Module } from '@nestjs/common';
import { RHDashboardController } from './dashboard.controller';
import { RHDashboardService } from './dashboard.service';
import { PrismaModule } from '../../prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [RHDashboardController],
  providers: [RHDashboardService],
})
export class RHDashboardModule { }