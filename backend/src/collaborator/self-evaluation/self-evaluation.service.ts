import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateSelfEvaluationDto } from './dto/create-self-evaluation.dto';
import { UpdateSelfEvaluationDto } from './dto/update-self-evaluation.dto';
import { ConflictException } from '@nestjs/common/exceptions/conflict.exception';

@Injectable()
export class SelfEvaluationService {
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

  async create(userId: number, dto: CreateSelfEvaluationDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user || !user.positionId || !user.unitId || !user.trackId) {
      throw new Error("Usuário incompleto");
    }

    const existing = await this.prisma.selfEvaluation.findFirst({
      where: { userId, cycleId: dto.cycleId },
    });

    if (existing) {
      throw new ConflictException("Autoavaliação já existe para este ciclo");
    }

    const itemsToCreate = await Promise.all(
      dto.items.map(async (item) => {
        const configured = await this.prisma.configuredCriterion.findFirst({
          where: {
            criterionId: item.criterionId,
            positionId: user.positionId!,
            unitId: user.unitId!,
            trackId: user.trackId!,
          },
        });

        if (!configured) {
          throw new Error(`Critério ${item.criterionId} não configurado para esse usuário`);
        }

        return {
          criterionId: item.criterionId,
          configuredCriterionId: configured.id,
          score: item.score,
          justification: item.justification,
          scoreDescription: this.getScoreDescription(item.score),
        };
      })
    );

    return await this.prisma.selfEvaluation.create({
      data: {
        userId,
        cycleId: dto.cycleId,
        averageScore: dto.averageScore,
        items: {
          createMany: {
            data: itemsToCreate,
          },
        },
      },
      include: {
        items: true,
      },
    });
  }

  async findByUser(where: { userId: number; cycleId?: number }) {
    const evaluations = await this.prisma.selfEvaluation.findMany({
      where,
      include: {
        items: {
          include: {
            criterion: true,
            configuredCriterion: {
              include: {
                group: true,
              },
            },
          },
        },
        cycle: true,
      },
    });

    return evaluations.map((evaluation) => {
      const now = new Date();
      const isEditable = evaluation.cycle.endDate > now;

      const itemsWithGroup = evaluation.items.map((item) => ({
        id: item.id,
        criterionId: item.criterionId,
        score: item.score,
        justification: item.justification,
        scoreDescription: item.scoreDescription,
        group: item.configuredCriterion?.group
          ? {
              id: item.configuredCriterion.group.id,
              name: item.configuredCriterion.group.name,
            }
          : null,
      }));

      return {
        ...evaluation,
        isEditable,
        averageScore: evaluation.averageScore,
        items: itemsWithGroup,
      };
    });
  }

  async update(id: number, dto: UpdateSelfEvaluationDto) {
    if (!dto.items || dto.items.length === 0) {
      throw new Error("Nenhum item de avaliação recebido.");
    }

    const evaluation = await this.prisma.selfEvaluation.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!evaluation || !evaluation.user?.positionId || !evaluation.user?.unitId || !evaluation.user?.trackId) {
      throw new Error("Usuário incompleto ou avaliação inexistente");
    }

    const itemsToCreate = await Promise.all(
      dto.items.map(async (item) => {
        const configured = await this.prisma.configuredCriterion.findFirst({
          where: {
            criterionId: item.criterionId,
            positionId: evaluation.user.positionId!,
            unitId: evaluation.user.unitId!,
            trackId: evaluation.user.trackId!,
          },
        });

        if (!configured) {
          throw new Error(`Critério ${item.criterionId} não configurado`);
        }

        return {
          criterionId: item.criterionId,
          configuredCriterionId: configured.id,
          score: item.score,
          justification: item.justification,
          scoreDescription: this.getScoreDescription(item.score),
        };
      })
    );

    return this.prisma.selfEvaluation.update({
      where: { id },
      data: {
        averageScore: dto.averageScore,
        items: {
          deleteMany: {},
          create: itemsToCreate,
        },
      },
      include: {
        items: true,
      },
    });
  }

  async delete(id: number) {
    try {
      const deletedItems = await this.prisma.selfEvaluationItem.deleteMany({
        where: { evaluationId: id },
      });

      const deletedEvaluation = await this.prisma.selfEvaluation.delete({
        where: { id },
      });

      return {
        message: `Autoavaliação ID ${id} e ${deletedItems.count} itens deletados com sucesso.`,
        deletedEvaluation,
      };
    } catch (error) {
      throw new Error(`Erro ao deletar avaliação ID ${id}: ${error.message}`);
    }
  }

  async getAvailableCriteria(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.positionId === null || user.unitId === null || user.trackId === null) {
      throw new Error('Usuário incompleto: faltam positionId, unitId ou trackId');
    }

    const configuredCriteria = await this.prisma.configuredCriterion.findMany({
      where: {
        positionId: user.positionId,
        unitId: user.unitId,
        trackId: user.trackId,
      },
      include: {
        criterion: true,
      },
    });

    return configuredCriteria.map((cc) => ({
      id: cc.criterion.id,
      title: cc.criterion.name,
      description: cc.criterion.generalDescription,
    }));
  }

  async getGroupedEvaluation(cycleId: number, userId: number) {
    const evaluation = await this.prisma.selfEvaluation.findFirst({
      where: { cycleId, userId },
      include: {
        items: {
          include: {
            configuredCriterion: {
              include: {
                group: true,
                criterion: true,
              },
            },
          },
        },
      },
    });

    if (!evaluation) {
      throw new Error('Avaliação não encontrada para esse ciclo e usuário.');
    }

    const grouped: Record<number, {
      groupId: number;
      groupName: string;
      criteria: {
        criterionId: number;
        title: string;
        description: string;
        score: number;
        justification: string;
      }[];
    }> = {};

    for (const item of evaluation.items) {
      const configured = item.configuredCriterion;

      if (!configured || !configured.group || !configured.criterion) continue;

      const criterion = configured.criterion;
      const group = configured.group;

      if (!grouped[group.id]) {
        grouped[group.id] = {
          groupId: group.id,
          groupName: group.name,
          criteria: [],
        };
      }

      grouped[group.id].criteria.push({
        criterionId: criterion.id,
        title: criterion.name,
        description: criterion.generalDescription,
        score: item.score,
        justification: item.justification,
      });
    }

    const result = Object.values(grouped);
    return result.sort((a, b) => a.groupName.localeCompare(b.groupName));
  }

  async getByUserId(userId: number) {
    const evaluations = await this.prisma.selfEvaluation.findMany({
      where: { userId },
      include: {
        cycle: true,
        items: {
          include: {
            criterion: true,
            configuredCriterion: {
              include: {
                group: true,
              },
            },
          },
        },
      },
      orderBy: {
        cycle: { startDate: 'desc' },
      },
    });

    return evaluations.map(evaluation => ({
      evaluationId: evaluation.id,
      averageScore: evaluation.averageScore,
      cycle: {
        id: evaluation.cycle.id,
        name: evaluation.cycle.name,
        startDate: evaluation.cycle.startDate,
        endDate: evaluation.cycle.endDate,
      },
      items: evaluation.items.map(item => ({
        criterionId: item.criterion.id,
        title: item.criterion.name,
        group: item.configuredCriterion?.group?.name ?? null,
        score: item.score,
        justification: item.justification,
      })),
    }));
  }

  async getSummary(userId: number, cycleId: number) {
    const evaluation = await this.prisma.selfEvaluation.findFirst({
      where: {
        userId,
        cycleId,
      },
      include: {
        cycle: true,
      },
    });

    if (!evaluation) {
      throw new Error('Avaliação não encontrada.');
    }

    return {
      evaluationId: evaluation.id,
      averageScore: evaluation.averageScore,
      createdAt: evaluation.createdAt,
      cycle: {
        id: evaluation.cycle.id,
        name: evaluation.cycle.name,
        startDate: evaluation.cycle.startDate,
        endDate: evaluation.cycle.endDate,
      },
    };
  }
}
