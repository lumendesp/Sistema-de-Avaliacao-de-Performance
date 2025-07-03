import { Module } from '@nestjs/common';
import { PeerEvaluationService } from './peer-evaluation.service';
import { PeerEvaluationController } from './peer-evaluation.controller';

import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [PeerEvaluationController],
  providers: [PeerEvaluationService, PrismaService],
})
export class PeerEvaluationModule {}
