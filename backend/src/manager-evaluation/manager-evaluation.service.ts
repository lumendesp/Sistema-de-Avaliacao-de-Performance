import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateManagerEvaluationDto } from './dto/create-manager-evaluation.dto';
import { UpdateManagerEvaluationDto } from './dto/update-manager-evaluation.dto';
import { encrypt, decrypt } from '../utils/encryption';

@Injectable()
export class ManagerEvaluationService {
  constructor(private prisma: PrismaService) {}

  private getScoreDescription(score: number): string {
    switch (score) {
      case 1:
        return 'Fica muito abaixo das expectativas';
      case 2:
        return 'Fica abaixo das expectativas';
      case 3:
        return 'Atinge as expectativas';
      case 4:
        return 'Fica acima das expectativas';
      case 5:
        return 'Supera as expectativas';
      default:
        return 'Nota inválida';
    }
  }

  async create(evaluatorId: number, dto: CreateManagerEvaluationDto) {
    if (evaluatorId === dto.evaluateeId) {
      throw new ConflictException('O gestor não pode se autoavaliar.');
    }
    const existing = await this.prisma.managerEvaluation.findFirst({
      where: {
        evaluatorId,
        evaluateeId: dto.evaluateeId,
        cycleId: dto.cycleId,
      },
    });
    if (existing) {
      throw new ConflictException(
        'Já existe avaliação deste gestor para este colaborador neste ciclo',
      );
    }
    // Só cria itens com score preenchido
    const itemsToCreate = dto.groups.flatMap((group) =>
      group.items
        .filter((item) => Number.isInteger(item.score))
        .map((item) => {
          const data: any = {
            criterion: { connect: { id: item.criterionId } },
            justification: encrypt(item.justification || ''),
            groupId: group.groupId,
            score: item.score,
            scoreDescription: this.getScoreDescription(item.score as number),
          };
          return data;
        }),
    );
    if (itemsToCreate.length === 0) {
      throw new ConflictException('Nenhum critério preenchido para avaliação.');
    }
    return this.prisma.managerEvaluation.create({
      data: {
        evaluatorId,
        evaluateeId: dto.evaluateeId,
        cycleId: dto.cycleId,
        items: {
          create: itemsToCreate,
        },
      },
      include: { items: true },
    });
  }

  async update(id: number, dto: UpdateManagerEvaluationDto) {
    const groups = (dto as any).groups;
    // Só atualiza se houver pelo menos um item com score preenchido
    const itemsToUpdate = groups
      ? groups.flatMap((group) =>
          group.items
            .filter((item) => Number.isInteger(item.score))
            .map((item) => ({
              criterion: { connect: { id: item.criterionId } },
              justification: encrypt(item.justification || ''),
              groupId: group.groupId,
              score: item.score,
              scoreDescription: this.getScoreDescription(item.score as number),
            })),
        )
      : [];
    if (!itemsToUpdate.length) {
      throw new ConflictException(
        'Nenhum critério preenchido para atualização.',
      );
    }

    // Atualiza apenas os itens enviados: para cada critério, faz upsert (atualiza se existe, cria se não existe)
    const updateOps = itemsToUpdate.map(async (item) => {
      return this.prisma.managerEvaluationItem.upsert({
        where: {
          evaluationId_criterionId: {
            evaluationId: id,
            criterionId: item.criterion.connect.id,
          },
        },
        update: {
          justification: item.justification,
          score: item.score,
          scoreDescription: item.scoreDescription,
        },
        create: {
          evaluation: { connect: { id } },
          criterion: { connect: { id: item.criterion.connect.id } },
          groupId: item.groupId,
          justification: item.justification,
          score: item.score,
          scoreDescription: item.scoreDescription,
        },
      });
    });
    await Promise.all(updateOps);
    // Atualiza status se necessário
    const updateData: any = {};
    if (dto.status === 'submitted') {
      updateData.status = 'submitted';
      updateData.createdAt = new Date();
    }
    return this.prisma.managerEvaluation.update({
      where: { id },
      data: updateData,
      include: { items: true },
    });
  }

  // Agrupa os itens por groupId ao retornar avaliações
  private groupItems(items: any[]) {
    // Descriptografa justification, mas score permanece number
    const groups: any = {};
    for (const item of items) {
      if (!groups[item.groupId]) {
        groups[item.groupId] = {
          groupId: item.groupId,
          items: [],
        };
      }
      groups[item.groupId].items.push({
        ...item,
        justification: decrypt(item.justification),
      });
    }
    return Object.values(groups);
  }

  async findByManager(evaluatorId: number) {
    const evaluations = await this.prisma.managerEvaluation.findMany({
      where: { evaluatorId },
      include: {
        items: true,
        evaluatee: { select: { name: true, email: true } },
        cycle: true,
      },
    });
    return evaluations.map((ev) => ({
      ...ev,
      groups: this.groupItems(ev.items),
    }));
  }

  async findByEvaluatee(evaluateeId: number) {
    const evaluations = await this.prisma.managerEvaluation.findMany({
      where: { evaluateeId },
      include: {
        items: true,
        evaluator: { select: { name: true, email: true } },
        cycle: true,
      },
    });
    return evaluations.map((ev) => ({
      ...ev,
      groups: this.groupItems(ev.items),
    }));
  }

  async findOne(id: number) {
    const evaluation = await this.prisma.managerEvaluation.findUnique({
      where: { id },
      include: {
        items: true,
        evaluator: { select: { name: true, email: true } },
        evaluatee: { select: { name: true, email: true } },
        cycle: true,
      },
    });
    if (!evaluation) throw new NotFoundException('Avaliação não encontrada');
    return { ...evaluation, groups: this.groupItems(evaluation.items) };
  }

  async findByEvaluatorAndEvaluatee(
    evaluatorId: number,
    evaluateeId: number,
    cycleId?: number,
  ) {
    const where: Record<string, any> = { evaluatorId, evaluateeId };
    if (typeof cycleId === 'number') {
      where.cycleId = cycleId;
    }
    const evaluation = await this.prisma.managerEvaluation.findFirst({
      where,
      include: {
        items: true,
        evaluator: { select: { name: true, email: true } },
        evaluatee: { select: { name: true, email: true } },
        cycle: true,
      },
    });
    if (!evaluation) return null;
    return { ...evaluation, groups: this.groupItems(evaluation.items) };
  }

  async getAverageScoreByCollaboratorAndCycle(
    collaboratorId: number,
    cycleId: number,
  ) {
    // Busca todas as avaliações de gestor recebidas pelo colaborador no ciclo
    const evaluations = await this.prisma.managerEvaluation.findMany({
      where: {
        evaluateeId: collaboratorId,
        cycleId: cycleId,
      },
      include: {
        items: true,
        cycle: true,
      },
    });

    // Coleta todos os scores dos itens das avaliações
    const allScores: number[] = [];
    let cycleInfo: { id: number; name: string } | null = null;
    for (const evaluation of evaluations) {
      if (!cycleInfo && evaluation.cycle) {
        cycleInfo = {
          id: evaluation.cycle.id,
          name: evaluation.cycle.name,
        };
      }
      for (const item of evaluation.items) {
        if (typeof item.score === 'number') {
          allScores.push(item.score);
        }
      }
    }

    if (allScores.length === 0) {
      return {
        averageScore: null,
        cycle: cycleInfo,
      };
    }

    const averageScore =
      allScores.reduce((sum, s) => sum + s, 0) / allScores.length;
    return {
      averageScore: parseFloat(averageScore.toFixed(1)),
      cycle: cycleInfo,
    };
  }
}
