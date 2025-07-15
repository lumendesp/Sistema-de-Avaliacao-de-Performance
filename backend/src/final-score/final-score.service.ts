import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateFinalScoreDto } from './dto/create-final-score.dto';
import { UpdateFinalScoreDto } from './dto/update-final-score.dto';
import { EvaluationCycleService } from '../evaluation-cycle/evaluation-cycle.service';
import { encrypt, decrypt } from '../utils/encryption';
import { CycleStatus } from '@prisma/client';

@Injectable()
export class FinalScoreService {
  constructor(
    private prisma: PrismaService,
    private cycleService: EvaluationCycleService,
  ) {}

  async create(adjusterId: number, dto: CreateFinalScoreDto) {
    try {
      // Check if the adjuster has committee role
      const adjuster = await this.prisma.user.findUnique({
        where: { id: adjusterId },
        include: { roles: true },
      });

      console.log('Adjuster ID:', adjusterId);
      console.log('Adjuster roles:', adjuster?.roles);


      // Get active cycle for Committee (antigo HR)
      console.log('Looking for active cycle...');
      const activeCycle = await this.cycleService.findActiveCycle('IN_PROGRESS_COMMITTEE' as CycleStatus);
      console.log('Active cycle found:', activeCycle);
      
      if (!activeCycle) {
        throw new Error('No active evaluation cycle found');
      }

      // Check if final score already exists for this user in this cycle
      console.log('Checking for existing final score...');
      const existing = await this.prisma.finalScore.findFirst({
        where: {
          userId: dto.userId,
          cycleId: activeCycle.id,
        },
      });

      console.log('Existing final score:', existing);

      if (existing) {
        throw new ForbiddenException('Final score already exists for this user in this cycle.');
      }

      // console.log('Creating final score with data:', {
      //   userId: dto.userId,
      //   cycleId: activeCycle.id,
      //   executionScore: dto.executionScore,
      //   postureScore: dto.postureScore,
      //   finalScore: dto.finalScore,
      //   summary: dto.summary,
      //   adjustedBy: adjusterId,
      //   justification: dto.justification,
      // });

      return this.prisma.finalScore.create({
        data: {
          userId: dto.userId,
          cycleId: activeCycle.id,
          executionScore: dto.executionScore,
          postureScore: dto.postureScore,
          finalScore: dto.finalScore,
          summary: dto.summary,
          adjustedBy: adjusterId,
          justification: encrypt(dto.justification),
        },
        include: {
          user: true,
          cycle: true,
          adjuster: { select: { id: true, name: true } },
        },
      });
    } catch (error) {
      console.error('Error in create final score:', error);
      throw error;
    }
  }

  async testActiveCycle() {
    try {
      const activeCycle = await this.cycleService.findActiveCycle('IN_PROGRESS_COMMITTEE' as CycleStatus);
      return {
        activeCycle,
        message: activeCycle ? 'Active cycle found' : 'No active cycle found'
      };
    } catch (error) {
      console.error('Error testing active cycle:', error);
      return { error: error.message };
    }
  }

  async findAll(cycleId?: number) {
    const where: any = {};
    if (cycleId) {
      where.cycleId = cycleId;
    }

    return this.prisma.finalScore.findMany({
      where,
      include: {
        user: true,
        cycle: true,
        adjuster: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const finalScore = await this.prisma.finalScore.findUnique({
      where: { id },
      include: {
        user: true,
        cycle: true,
        adjuster: { select: { id: true, name: true } },
      },
    });

    if (!finalScore) {
      throw new NotFoundException('Final score not found');
    }

    return finalScore;
  }

  async findByUser(userId: number, cycleId?: number) {
    const where: any = { userId };
    if (cycleId) {
      where.cycleId = cycleId;
    }

    return this.prisma.finalScore.findMany({
      where,
      include: {
        cycle: true,
        adjuster: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: number, adjusterId: number, dto: UpdateFinalScoreDto) {
    // Check if the adjuster has committee role
    const adjuster = await this.prisma.user.findUnique({
      where: { id: adjusterId },
      include: { roles: true },
    });

    const isCommittee = adjuster?.roles.some((r) => r.role === 'COMMITTEE');
    if (!isCommittee) {
      throw new ForbiddenException('Only committee members can update final scores.');
    }

    const finalScore = await this.prisma.finalScore.findUnique({
      where: { id },
    });

    if (!finalScore) {
      throw new NotFoundException('Final score not found');
    }

    return this.prisma.finalScore.update({
      where: { id },
      data: {
        ...dto,
        justification: dto.justification ? encrypt(dto.justification) : undefined,
        adjustedBy: adjusterId,
      },
      include: {
        user: true,
        cycle: true,
        adjuster: { select: { id: true, name: true } },
      },
    });
  }

  async getFinalScoreGradeByUserAndCycle(userId: number, cycleId: number) {
    const score = await this.prisma.finalScore.findFirst({
      where: { userId, cycleId },
      select: { finalScore: true, id: true, userId: true, cycleId: true },
    });
    return score;
  }
} 