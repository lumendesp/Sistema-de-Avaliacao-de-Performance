import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Prisma, $Enums } from '@prisma/client';

@Injectable()
export class OkrService {
  constructor(private readonly prisma: PrismaService) {}

  // OKR CRUD
  async createOkr(data: { userId: number; objective: string; dueDate: string; keyResults: string[] }) {
    return this.prisma.okr.create({
      data: {
        userId: data.userId,
        objective: data.objective,
        dueDate: new Date(data.dueDate),
        keyResults: {
          create: data.keyResults.map(description => ({ description })),
        },
      },
      include: { keyResults: true },
    });
  }

  async getOkrsByUser(userId: number) {
    return this.prisma.okr.findMany({
      where: { userId },
      include: { keyResults: true },
    });
  }

  async updateOkr(id: number, data: { objective?: string; dueDate?: string; progress?: number; status?: string }) {
    return this.prisma.okr.update({
      where: { id },
      data: {
        ...data,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        status: data.status as $Enums.OKRStatus,
      },
      include: { keyResults: true },
    });
  }

  async deleteOkr(id: number) {
    return this.prisma.okr.delete({ where: { id } });
  }

  // KeyResult CRUD
  async addKeyResult(okrId: number, description: string) {
    return this.prisma.keyResult.create({
      data: { okrId, description },
    });
  }

  async updateKeyResult(id: number, description: string) {
    return this.prisma.keyResult.update({
      where: { id },
      data: { description },
    });
  }

  async deleteKeyResult(id: number) {
    return this.prisma.keyResult.delete({ where: { id } });
  }
} 