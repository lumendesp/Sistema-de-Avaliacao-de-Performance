import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class EvaluationCycleService {
  constructor(private prisma: PrismaService) {}

  // função para buscar o ciclo atual (o que está ativo)
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
          not: activeCycle?.id, // Exclui o ativo
        },
        startDate: {
          lt: activeCycle?.startDate, // Só os anteriores
        },
      },
      orderBy: {
        startDate: 'desc',
      },
    });
  }
}

