import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PdiService {
  constructor(private readonly prisma: PrismaService) {}

  // CRUD PDI
  async createPdi(data: { userId: number; title: string; description?: string }) {
    return this.prisma.pDI.create({ data });
  }

  async getPdiByUser(userId: number) {
    return this.prisma.pDI.findMany({
      where: { userId },
      include: { actions: true },
    });
  }

  async updatePdi(id: number, data: { title?: string; description?: string }) {
    return this.prisma.pDI.update({ where: { id }, data });
  }

  async deletePdi(id: number) {
    return this.prisma.pDI.delete({ where: { id } });
  }

  // CRUD PDIAction
  async createPdiAction(data: { pdiId: number; title: string; description: string; category: string; priority: string; status: string; dueDate: string; progress: number; goals?: any }) {
    return this.prisma.pDIAction.create({
      data: { ...data, dueDate: data.dueDate, goals: data.goals },
    });
  }

  async updatePdiAction(id: number, data: { title?: string; description?: string; category?: string; priority?: string; status?: string; dueDate?: string; progress?: number; goals?: any }) {
    const updateData: any = { ...data };
    if (typeof updateData.goals === 'undefined') {
      delete updateData.goals;
    }
    return this.prisma.pDIAction.update({ where: { id }, data: updateData });
  }

  async deletePdiAction(id: number) {
    try {
      return await this.prisma.pDIAction.delete({ where: { id } });
    } catch (error) {
      if (error.code === 'P2025') {
        // Registro não encontrado para deletar
        return null;
      }
      throw error;
    }
  }
} 