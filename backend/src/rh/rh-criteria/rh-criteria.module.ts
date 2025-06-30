import { Module } from '@nestjs/common';
import { RhCriteriaController } from './rh-criteria.controller';
import { RhCriteriaService } from './rh-criteria.service';
import { PrismaModule } from '../../prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [RhCriteriaController],
  providers: [RhCriteriaService]
})
export class RhCriteriaModule {}
