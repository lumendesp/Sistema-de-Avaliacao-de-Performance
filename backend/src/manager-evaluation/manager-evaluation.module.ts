import { Module } from '@nestjs/common';
import { ManagerEvaluationController } from './manager-evaluation.controller';
import { ManagerEvaluationService } from './manager-evaluation.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [ManagerEvaluationController],
  providers: [ManagerEvaluationService, PrismaService],
})
export class ManagerEvaluationModule {}
