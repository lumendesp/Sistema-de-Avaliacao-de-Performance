import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CycleStatus } from '@prisma/client';

@Injectable()
export class EvaluationCycleService {
  constructor(private prisma: PrismaService) {}

  async findActiveCycle(status?: CycleStatus) {
    if (!status) {
      throw new Error('Status do ciclo deve ser especificado!');
    }
    return this.prisma.evaluationCycle.findFirst({
      where: { 
        status: status,
      },
    });
  }

  async findCommitteeEqualizationCycle() {
    return this.prisma.evaluationCycle.findFirst({
      where: { 
        status: 'IN_PROGRESS_COMMITTEE',
        // type: Role.COMMITTEE
      },
      orderBy: {
        endDate: 'desc'
      }
    });
  }
 
  async getClosedCycles() {
    // Busca o ciclo mais recente de qualquer status IN_PROGRESS_*
    const activeCycle = await this.prisma.evaluationCycle.findFirst({
      where: {
        status: {
          in: [
            'IN_PROGRESS_COLLABORATOR',
            'IN_PROGRESS_MANAGER',
            'IN_PROGRESS_COMMITTEE',
          ] as unknown as CycleStatus[],
        },
      },
      orderBy: { startDate: 'desc' },
    });

    return this.prisma.evaluationCycle.findMany({
      where: {
        id: {
          not: activeCycle?.id,
        },
        status: {
          in: ['CLOSED', 'PUBLISHED'] as unknown as CycleStatus[],
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

