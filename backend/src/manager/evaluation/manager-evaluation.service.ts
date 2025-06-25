import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

interface ManagerEvaluationItemDto {
  criterionId: number;
  score: number;
  justification: string;
  scoreDescription?: string;
}

interface CreateManagerEvaluationDto {
  evaluateeId: number;
  cycleId: number;
  items: ManagerEvaluationItemDto[];
}

interface UpdateManagerEvaluationDto {
  cycleId?: number;
  items?: ManagerEvaluationItemDto[];
}

@Injectable()
export class ManagerEvaluationService {
  constructor(private prisma: PrismaService) {}

  async create(evaluatorId: number, dto: CreateManagerEvaluationDto) {
    const { evaluateeId, cycleId, items } = dto;
    return this.prisma.managerEvaluation.create({
      data: {
        evaluatorId,
        evaluateeId,
        cycleId,
        items: {
          create: items.map((item) => ({
            criterionId: item.criterionId,
            score: item.score,
            justification: item.justification,
            scoreDescription: item.scoreDescription || '',
          })),
        },
      },
      include: { items: true },
    });
  }

  async findByManager(evaluatorId: number) {
    return this.prisma.managerEvaluation.findMany({
      where: { evaluatorId },
      include: {
        cycle: true,
        items: { include: { criterion: true } },
        evaluatee: true,
      },
    });
  }

  async findByEvaluatee(evaluateeId: number) {
    return this.prisma.managerEvaluation.findMany({
      where: { evaluateeId },
      include: {
        cycle: true,
        items: { include: { criterion: true } },
        evaluator: true,
      },
    });
  }

  async update(id: number, dto: UpdateManagerEvaluationDto) {
    const { cycleId, items } = dto;
    return this.prisma.managerEvaluation.update({
      where: { id },
      data: {
        ...(cycleId && { cycleId }),
        ...(items && {
          items: {
            deleteMany: {},
            create: items.map((item) => ({
              criterionId: item.criterionId,
              score: item.score,
              justification: item.justification,
              scoreDescription: item.scoreDescription || '',
            })),
          },
        }),
      },
      include: { items: true },
    });
  }
}
