import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class EvaluationCycleService {
  constructor(private prisma: PrismaService) {}

  async findActiveCycle(type?: Role) {
    // For committee, look for in-progress cycles for equalization
    if (type === Role.COMMITTEE) {
      return this.prisma.evaluationCycle.findFirst({
        where: {
          status: 'IN_PROGRESS',
          type: Role.COMMITTEE
        },
        orderBy: {
          startDate: 'desc'
        }
      });
    }
    // For other roles, look for cycles in progress
    return this.prisma.evaluationCycle.findFirst({
      where: {
        status: 'IN_PROGRESS',
        ...(type ? { type } : {})
      },
    });
  }

  async findCommitteeEqualizationCycle() {
    return this.prisma.evaluationCycle.findFirst({
      where: { 
        status: 'CLOSED',
        type: Role.COMMITTEE
      },
      orderBy: {
        endDate: 'desc'
      }
    });
  }
 
  async getClosedCycles() {
    const activeCycle = await this.findActiveCycle(undefined);

    return this.prisma.evaluationCycle.findMany({
      where: {
        id: {
          not: activeCycle?.id,
        },
        status: {
          in: ['CLOSED', 'PUBLISHED'], // <== AQUI A MÁGICA
        },
      },
      orderBy: {
        startDate: 'desc',
      },
    });
  }


  async getMostRecentCycle() {
    return this.prisma.evaluationCycle.findFirst({
      orderBy: {
        startDate: 'desc',
      },
    });
  }
}

