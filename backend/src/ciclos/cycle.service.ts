import { Injectable } from '@nestjs/common';
import { PrismaClient, Role, EvaluationCycle, CycleStatus, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class CycleService {
  async getMostRecentCycle(type: Role, status: CycleStatus = 'IN_PROGRESS') {
    return prisma.evaluationCycle.findFirst({
      where: { type, status },
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