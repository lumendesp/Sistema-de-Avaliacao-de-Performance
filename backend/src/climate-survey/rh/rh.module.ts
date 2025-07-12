import { Module } from '@nestjs/common';
import { RhService } from './rh.service';
import { RhController } from './rh.controller';
import { PrismaModule } from 'src/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [RhController],
  providers: [RhService],
})
export class RhModule {}
