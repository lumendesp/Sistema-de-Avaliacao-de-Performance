import { Module } from '@nestjs/common';
import { ImportController } from './import.controller';
import { ImportService } from './import.service';
import { PrismaModule } from '../../prisma.module';

@Module({
  imports: [PrismaModule], // Apenas a dependência do Prisma
  controllers: [ImportController],
  providers: [ImportService]
})
export class ImportModule { }