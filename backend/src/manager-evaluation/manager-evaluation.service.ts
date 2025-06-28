import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateManagerEvaluationDto, ManagerEvaluationItemDto } from './dto/create-manager-evaluation.dto';
import { UpdateManagerEvaluationDto } from './dto/update-manager-evaluation.dto';

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
      throw new ConflictException('Já existe avaliação deste gestor para este colaborador neste ciclo');
    }
    return this.prisma.managerEvaluation.create({
      data: {
        evaluatorId,
        evaluateeId: dto.evaluateeId,
        cycleId: dto.cycleId,
        items: {
          create: dto.items.map((item: ManagerEvaluationItemDto) => ({
            criterion: { connect: { id: item.criterionId } },
            score: item.score,
            justification: item.justification || '',
            scoreDescription: this.getScoreDescription(item.score),
          })),
        },
      },
      include: { items: true },
    });
  }

  async update(id: number, dto: UpdateManagerEvaluationDto) {
    const items = (dto as any).items;
    return this.prisma.managerEvaluation.update({
      where: { id },
      data: {
        ...(items && {
          items: {
            deleteMany: {},
            create: items.map((item: ManagerEvaluationItemDto) => ({
              criterion: { connect: { id: item.criterionId } },
              score: item.score,
              justification: item.justification || '',
              scoreDescription: this.getScoreDescription(item.score),
            })),
          },
        }),
      },
      include: { items: true },
    });
  }

  async findByManager(evaluatorId: number) {
    return this.prisma.managerEvaluation.findMany({
      where: { evaluatorId },
      include: {
        items: true,
        evaluatee: { select: { name: true, email: true } },
        cycle: true,
      },
    });
  }

  async findByEvaluatee(evaluateeId: number) {
    return this.prisma.managerEvaluation.findMany({
      where: { evaluateeId },
      include: {
        items: true,
        evaluator: { select: { name: true, email: true } },
        cycle: true,
      },
    });
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
    return evaluation;
  }

  async findByEvaluatorAndEvaluatee(evaluatorId: number, evaluateeId: number) {
    return this.prisma.managerEvaluation.findFirst({
      where: { evaluatorId, evaluateeId },
      include: {
        items: true,
        evaluator: { select: { name: true, email: true } },
        evaluatee: { select: { name: true, email: true } },
        cycle: true,
      },
    });
  }
}
