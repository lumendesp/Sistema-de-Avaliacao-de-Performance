import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma.module';
import { PdiController } from './pdi.controller';
import { PdiService } from './pdi.service';

@Module({
  imports: [PrismaModule],
  controllers: [PdiController],
  providers: [PdiService],
})
export class PdiModule {} 