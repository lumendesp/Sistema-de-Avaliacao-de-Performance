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
    const existing = await this.prisma.selfEvaluation.findFirst({
      where: {
        userId,
        cycleId: dto.cycleId,
      },
    });

    if (existing) {
      throw new ConflictException('Autoavaliação já existe para este ciclo');
    }

    return this.prisma.selfEvaluation.create({
      data: {
        userId,
        cycleId: dto.cycleId,
        items: {
          createMany: {
            data: dto.items.map((item) => ({
              criterionId: item.criterionId,
              score: item.score,
              justification: item.justification,
              scoreDescription: this.getScoreDescription(item.score),
            })),
          },
        },
      },
      include: {
        items: true,
      },
    });
  }

  async findByUser(where: { userId: number; cycleId?: number }) {
    return this.prisma.selfEvaluation.findMany({
      where,
      include: {
        items: true,
        cycle: true,
      },
    });
  }

  async update(id: number, dto: UpdateSelfEvaluationDto) {
    const { cycleId, items } = dto;

    return this.prisma.selfEvaluation.update({
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
              scoreDescription: this.getScoreDescription(item.score),
            })),
          },
        }),
      },
      include: { items: true },
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

    if (
      !user ||
      user.positionId === null ||
      user.unitId === null ||
      user.trackId === null
    ) {
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
}
