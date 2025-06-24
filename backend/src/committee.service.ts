import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Injectable()
export class CommitteeService {
  constructor(private readonly prisma: PrismaService) {}

  async getUsersWithEvaluations() {
    const users = await this.prisma.user.findMany({
      include: {
        roles: true,
        peerEvaluationsReceived: true,
        mentorEvaluationsReceived: true,
        finalEvaluationsReceived: true,
      },
    });

    return users.map(user => {
      const evaluationsEvaluated = [
        ...(user.peerEvaluationsReceived?.map(e => ({ 
          type: 'PEER', 
          score: e.score,
          status: 'FINALIZED'
        })) || []),
        ...(user.mentorEvaluationsReceived?.map(e => ({ 
          type: 'MANAGER', 
          score: e.score,
          justification: e.justification,
          status: 'FINALIZED'
        })) || []),
        ...(user.finalEvaluationsReceived?.map(e => ({ 
          type: 'FINAL', 
          score: e.score,
          justification: e.justification,
          status: 'FINALIZED'
        })) || []),
      ];
      
      // Check if user has all 3 evaluations (PEER, MANAGER, FINAL)
      // Note: SELF evaluation is not in the current schema
      const hasAllEvaluations = evaluationsEvaluated.length >= 3;
      
      return {
        ...user,
        evaluationsEvaluated,
        hasAllEvaluations,
      };
    });
  }

  async createFinalEvaluation(data: { score: number; justification: string; evaluateeId: number; evaluatorId: number }) {
    return this.prisma.finalEvaluation.create({
      data: {
        ...data,
        editedAt: new Date(),
      },
    });
  }
} 