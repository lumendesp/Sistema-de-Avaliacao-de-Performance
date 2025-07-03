import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateManagerEvaluationDto } from './dto/create-manager-evaluation.dto';
import { UpdateManagerEvaluationDto } from './dto/update-manager-evaluation.dto';
import { EvaluationCycleService } from '../evaluation-cycle/evaluation-cycle.service';

@Injectable()
export class ManagerEvaluationService {
  constructor(
    private prisma: PrismaService,
    private cycleService: EvaluationCycleService,
  ) {}

  async create(evaluatorId: number, dto: CreateManagerEvaluationDto) {
    // Check if the evaluator has manager role
    const evaluator = await this.prisma.user.findUnique({
      where: { id: evaluatorId },
      include: { roles: true },
    });

    const isManager = evaluator?.roles.some((r) => r.role === 'MANAGER');
    if (!isManager) {
      throw new ForbiddenException('Only managers can create manager evaluations.');
    }

    // Get active cycle
    const activeCycle = await this.cycleService.findActiveCycle();
    if (!activeCycle) {
      throw new Error('No active evaluation cycle found');
    }

    // Check if evaluation already exists for this user in this cycle
    const existing = await this.prisma.managerEvaluation.findFirst({
      where: {
        evaluatorId,
        evaluateeId: dto.evaluateeId,
        cycleId: activeCycle.id,
      },
    });

    if (existing) {
      throw new ForbiddenException('Manager evaluation already exists for this user in this cycle.');
    }

    // Create the evaluation
    const evaluation = await this.prisma.managerEvaluation.create({
      data: {
        evaluatorId,
        evaluateeId: dto.evaluateeId,
        cycleId: activeCycle.id,
      },
    });

    // Create evaluation items
    if (dto.items && dto.items.length > 0) {
      await this.prisma.managerEvaluationItem.createMany({
        data: dto.items.map(item => ({
          evaluationId: evaluation.id,
          criterionId: item.criterionId,
          score: item.score,
          justification: item.justification,
          scoreDescription: this.getScoreDescription(item.score),
        })),
      });
    }

    return this.prisma.managerEvaluation.findUnique({
      where: { id: evaluation.id },
      include: {
        evaluator: { select: { id: true, name: true } },
        evaluatee: { select: { id: true, name: true } },
        items: {
          include: {
            criterion: true,
          },
        },
        cycle: true,
      },
    });
  }

  async findAll(cycleId?: number) {
    const where: any = {};
    if (cycleId) {
      where.cycleId = cycleId;
    }

    return this.prisma.managerEvaluation.findMany({
      where,
      include: {
        evaluator: { select: { id: true, name: true } },
        evaluatee: { select: { id: true, name: true } },
        items: {
          include: {
            criterion: true,
          },
        },
        cycle: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const evaluation = await this.prisma.managerEvaluation.findUnique({
      where: { id },
      include: {
        evaluator: { select: { id: true, name: true } },
        evaluatee: { select: { id: true, name: true } },
        items: {
          include: {
            criterion: true,
          },
        },
        cycle: true,
      },
    });

    if (!evaluation) {
      throw new NotFoundException('Manager evaluation not found');
    }

    return evaluation;
  }

  async findByUser(userId: number, cycleId?: number) {
    const where: any = { evaluateeId: userId };
    if (cycleId) {
      where.cycleId = cycleId;
    }

    return this.prisma.managerEvaluation.findMany({
      where,
      include: {
        evaluator: { select: { id: true, name: true } },
        items: {
          include: {
            criterion: true,
          },
        },
        cycle: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByEvaluator(evaluatorId: number, cycleId?: number) {
    const where: any = { evaluatorId };
    if (cycleId) {
      where.cycleId = cycleId;
    }

    return this.prisma.managerEvaluation.findMany({
      where,
      include: {
        evaluatee: { select: { id: true, name: true } },
        items: {
          include: {
            criterion: true,
          },
        },
        cycle: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: number, evaluatorId: number, dto: UpdateManagerEvaluationDto) {
    const evaluation = await this.prisma.managerEvaluation.findUnique({
      where: { id },
    });

    if (!evaluation) {
      throw new NotFoundException('Manager evaluation not found');
    }

    if (evaluation.evaluatorId !== evaluatorId) {
      throw new ForbiddenException('You can only update your own evaluations.');
    }

    // Update evaluation items if provided
    if (dto.items && dto.items.length > 0) {
      // Delete existing items
      await this.prisma.managerEvaluationItem.deleteMany({
        where: { evaluationId: id },
      });

      // Create new items
      await this.prisma.managerEvaluationItem.createMany({
        data: dto.items.map(item => ({
          evaluationId: id,
          criterionId: item.criterionId,
          score: item.score,
          justification: item.justification,
          scoreDescription: this.getScoreDescription(item.score),
        })),
      });
    }

    return this.prisma.managerEvaluation.findUnique({
      where: { id },
      include: {
        evaluator: { select: { id: true, name: true } },
        evaluatee: { select: { id: true, name: true } },
        items: {
          include: {
            criterion: true,
          },
        },
        cycle: true,
      },
    });
  }

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
} 