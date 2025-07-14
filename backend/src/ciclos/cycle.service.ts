import { Injectable } from '@nestjs/common';
import { PrismaClient, CycleStatus, EvaluationCycle, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class CycleService {
  async getMostRecentCycle(status: CycleStatus) {
    return prisma.evaluationCycle.findFirst({
      where: { status },
      orderBy: { startDate: 'desc' }
    });
  }

  async closeCycle(cycleId: number) {
    return prisma.evaluationCycle.update({
      where: { id: cycleId },
      data: { status: 'CLOSED' }
    });
  }

  async createCycle(data: Omit<Prisma.EvaluationCycleCreateInput, 'id' | 'createdAt'>) {
    return prisma.evaluationCycle.create({ data });
  }
} 