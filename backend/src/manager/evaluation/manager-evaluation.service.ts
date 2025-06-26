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

  // Cria avaliações para todos os colaboradores de todos os gestores no início do ciclo
  async generateAllForCycle(cycleId: number) {
    // Busca todos os relacionamentos gestor-colaborador
    const relations = await this.prisma.managerCollaborator.findMany();
    // Para cada relação, cria avaliação se não existir
    for (const rel of relations) {
      const exists = await this.prisma.managerEvaluation.findFirst({
        where: {
          evaluatorId: rel.managerId,
          evaluateeId: rel.collaboratorId,
          cycleId,
        },
      });
      if (!exists) {
        await this.prisma.managerEvaluation.create({
          data: {
            evaluatorId: rel.managerId,
            evaluateeId: rel.collaboratorId,
            cycleId,
            status: 'draft',
            items: { create: [] },
          },
        });
      }
    }
    return { message: 'Avaliações de gestores geradas.' };
  }

  // Update só se status for draft
  async update(id: number, dto: UpdateManagerEvaluationDto) {
    const evaluation = await this.prisma.managerEvaluation.findUnique({
      where: { id },
    });
    if (!evaluation) throw new Error('Avaliação não encontrada');
    if (evaluation.status !== 'draft')
      throw new Error('Avaliação já enviada, não pode mais editar');
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

  // Envia avaliação (muda status para submitted)
  async submit(id: number) {
    const evaluation = await this.prisma.managerEvaluation.findUnique({
      where: { id },
    });
    if (!evaluation) throw new Error('Avaliação não encontrada');
    if (evaluation.status !== 'draft') throw new Error('Avaliação já enviada');
    return this.prisma.managerEvaluation.update({
      where: { id },
      data: { status: 'submitted' },
    });
  }
}
