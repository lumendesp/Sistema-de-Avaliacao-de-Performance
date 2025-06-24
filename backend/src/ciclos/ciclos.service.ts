import { Injectable } from '@nestjs/common';
import { CreateCicloDto } from './dto/create-ciclo.dto';
import { UpdateCicloDto } from './dto/update-ciclo.dto';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class CiclosService {
  async create(createCicloDto: CreateCicloDto) {
    return prisma.evaluationCycle.create({
      data: {
        name: createCicloDto.name,
        startDate: new Date(createCicloDto.startDate),
        endDate: new Date(createCicloDto.endDate),
        status: createCicloDto.status as any,
      },
    });
  }

  async findAll() {
    return prisma.evaluationCycle.findMany();
  }

  async findOne(id: number) {
    return prisma.evaluationCycle.findUnique({ where: { id } });
  }

  async update(id: number, updateCicloDto: UpdateCicloDto) {
    return prisma.evaluationCycle.update({
      where: { id },
      data: {
        ...updateCicloDto,
        status: updateCicloDto.status as any,
      },
    });
  }

  async remove(id: number) {
    return prisma.evaluationCycle.delete({ where: { id } });
  }

  async getHistoricoCiclos(userId: number) {
    const notas = await prisma.finalScore.findMany({
      where: { userId },
      include: { cycle: true },
      orderBy: { cycle: { startDate: 'desc' } },
    });

    const selfEvals = await prisma.selfEvaluation.findMany({
      where: { userId },
      include: { items: true },
    });

    return notas.map(nota => {
      const selfEval = selfEvals.find(se => se.cycleId === nota.cycleId);
      let self = '-';
      if (selfEval && selfEval.items && selfEval.items.length > 0) {
        // Calcula a média dos scores dos items
        const scores = selfEval.items.map(item => item.score);
        const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
        self = avg.toFixed(2);
      }
      return {
        cycle: nota.cycle.name,
        status: nota.cycle.status === 'IN_PROGRESS' ? 'Em andamento' : 'Finalizado',
        self,
        exec: nota.executionScore ?? '-',
        posture: nota.postureScore ?? '-',
        final: nota.finalScore ?? '-',
        summary: nota.summary ?? '-',
      };
    });
  }
}
