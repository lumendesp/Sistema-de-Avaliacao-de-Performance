import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class EvaluationCycleService {
  constructor(private prisma: PrismaService) {}

  async findActiveCycle() {
    return this.prisma.evaluationCycle.findFirst({
      where: { status: 'IN_PROGRESS' },
    });
  }
 
  async getClosedCycles() {
    const activeCycle = await this.findActiveCycle();

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

