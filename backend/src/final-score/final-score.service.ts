import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateFinalScoreDto } from './dto/create-final-score.dto';
import { UpdateFinalScoreDto } from './dto/update-final-score.dto';
import { EvaluationCycleService } from '../evaluation-cycle/evaluation-cycle.service';
import { encrypt, decrypt } from '../utils/encryption';

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

      // Temporarily disable committee check for debugging
      // const isCommittee = adjuster?.roles.some((r) => r.role === 'COMMITTEE');
      // if (!isCommittee) {
      //   throw new ForbiddenException('Only committee members can create final scores.');
      // }

      // Get active cycle
      console.log('Looking for active cycle...');
      const activeCycle = await this.cycleService.findActiveCycle();
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
        throw new ForbiddenException(
          'Final score already exists for this user in this cycle.',
        );
      }

      console.log('Creating final score with data:', {
        userId: dto.userId,
        cycleId: activeCycle.id,
        executionScore: dto.executionScore,
        postureScore: dto.postureScore,
        finalScore: dto.finalScore,
        summary: dto.summary,
        adjustedBy: adjusterId,
        justification: dto.justification,
      });

      return this.prisma.finalScore.create({
        data: {
          userId: dto.userId,
          cycleId: activeCycle.id,
          executionScore:
            dto.executionScore !== undefined
              ? encrypt(dto.executionScore.toString())
              : null,
          postureScore:
            dto.postureScore !== undefined
              ? encrypt(dto.postureScore.toString())
              : null,
          finalScore:
            dto.finalScore !== undefined
              ? encrypt(dto.finalScore.toString())
              : null,
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
      const activeCycle = await this.cycleService.findActiveCycle();
      return {
        activeCycle,
        message: activeCycle ? 'Active cycle found' : 'No active cycle found',
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

    const results = await this.prisma.finalScore.findMany({
      where,
      include: {
        user: true,
        cycle: true,
        adjuster: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return results.map((fs) => ({
      ...fs,
      executionScore: fs.executionScore
        ? Number(decrypt(fs.executionScore))
        : null,
      postureScore: fs.postureScore ? Number(decrypt(fs.postureScore)) : null,
      finalScore: fs.finalScore ? Number(decrypt(fs.finalScore)) : null,
      justification: decrypt(fs.justification),
    }));
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

    return {
      ...finalScore,
      executionScore: finalScore.executionScore
        ? Number(decrypt(finalScore.executionScore))
        : null,
      postureScore: finalScore.postureScore
        ? Number(decrypt(finalScore.postureScore))
        : null,
      finalScore: finalScore.finalScore
        ? Number(decrypt(finalScore.finalScore))
        : null,
      justification: decrypt(finalScore.justification),
    };
  }

  async findByUser(userId: number, cycleId?: number) {
    const where: any = { userId };
    if (cycleId) {
      where.cycleId = cycleId;
    }

    const results = await this.prisma.finalScore.findMany({
      where,
      include: {
        cycle: true,
        adjuster: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return results.map((fs) => ({
      ...fs,
      executionScore: fs.executionScore
        ? Number(decrypt(fs.executionScore))
        : null,
      postureScore: fs.postureScore ? Number(decrypt(fs.postureScore)) : null,
      finalScore: fs.finalScore ? Number(decrypt(fs.finalScore)) : null,
      justification: decrypt(fs.justification),
    }));
  }

  async update(id: number, adjusterId: number, dto: UpdateFinalScoreDto) {
    // Check if the adjuster has committee role
    const adjuster = await this.prisma.user.findUnique({
      where: { id: adjusterId },
      include: { roles: true },
    });

    const isCommittee = adjuster?.roles.some((r) => r.role === 'COMMITTEE');
    if (!isCommittee) {
      throw new ForbiddenException(
        'Only committee members can update final scores.',
      );
    }

    const finalScore = await this.prisma.finalScore.findUnique({
      where: { id },
    });

    if (!finalScore) {
      throw new NotFoundException('Final score not found');
    }

    const data: any = {
      ...dto,
      adjustedBy: adjusterId,
    };
    if (dto.executionScore !== undefined)
      data.executionScore = encrypt(dto.executionScore.toString());
    if (dto.postureScore !== undefined)
      data.postureScore = encrypt(dto.postureScore.toString());
    if (dto.finalScore !== undefined)
      data.finalScore = encrypt(dto.finalScore.toString());
    if (dto.justification !== undefined)
      data.justification = encrypt(dto.justification);

    const updated = await this.prisma.finalScore.update({
      where: { id },
      data,
      include: {
        user: true,
        cycle: true,
        adjuster: { select: { id: true, name: true } },
      },
    });
    return {
      ...updated,
      executionScore: updated.executionScore
        ? Number(decrypt(updated.executionScore))
        : null,
      postureScore: updated.postureScore
        ? Number(decrypt(updated.postureScore))
        : null,
      finalScore: updated.finalScore
        ? Number(decrypt(updated.finalScore))
        : null,
      justification: decrypt(updated.justification),
    };
  }

  async getFinalScoreGradeByUserAndCycle(userId: number, cycleId: number) {
    const score = await this.prisma.finalScore.findFirst({
      where: { userId, cycleId },
      select: { finalScore: true, id: true, userId: true, cycleId: true },
    });
    if (!score) return null;
    return {
      ...score,
      finalScore: score.finalScore ? Number(decrypt(score.finalScore)) : null,
    };
  }
}
