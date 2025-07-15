import { Module } from '@nestjs/common';
import { OkrService } from './okr.service';
import { OkrController } from './okr.controller';
import { PrismaModule } from '../prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [OkrController],
  providers: [OkrService],
})
export class OkrModule {} 