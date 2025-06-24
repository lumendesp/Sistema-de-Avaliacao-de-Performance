import { Module } from '@nestjs/common';
import { PeerEvaluationsService } from './peer-evaluations.service';
import { PeerEvaluationsController } from './peer-evaluations.controller';
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [PeerEvaluationsController],
  providers: [PeerEvaluationsService, PrismaService],
  exports: [PeerEvaluationsService],
})
export class PeerEvaluationsModule {}
