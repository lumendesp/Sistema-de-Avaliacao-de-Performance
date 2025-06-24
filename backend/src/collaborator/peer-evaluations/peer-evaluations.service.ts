import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreatePeerEvaluationDto } from './peer-evaluation.dto';

@Injectable()
export class PeerEvaluationsService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreatePeerEvaluationDto) {
    return this.prisma.peerEvaluation.create({
      data,
    });
  }

  async findAllByEvaluator(evaluatorId: number) {
    return this.prisma.peerEvaluation.findMany({
      where: { evaluatorId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
