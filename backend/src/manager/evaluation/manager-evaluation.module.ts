import { Module } from '@nestjs/common';
import { ManagerEvaluationService } from './manager-evaluation.service';
import { ManagerEvaluationController } from './manager-evaluation.controller';
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [ManagerEvaluationController],
  providers: [ManagerEvaluationService, PrismaService],
})
export class ManagerEvaluationModule {}
