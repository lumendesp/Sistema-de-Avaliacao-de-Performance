import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateSelfEvaluationDto } from './dto/create-self-evaluation.dto';
import { UpdateSelfEvaluationDto } from './dto/update-self-evaluation.dto';

@Injectable()
export class SelfEvaluationService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, dto: CreateSelfEvaluationDto) {
    const { cycleId, items } = dto;

    const selfEvaluation = await this.prisma.selfEvaluation.create({
      data: {
        userId,
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

    return selfEvaluation;
  }

  async findByUser(userId: number) {
    return this.prisma.selfEvaluation.findMany({
      where: { userId },
      include: {
        cycle: true,
        items: {
          include: {
            criterion: true,
          },
        },
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
              scoreDescription: item.scoreDescription || '',
            })),
          },
        }),
      },
      include: { items: true },
    });
  }

  async delete(id: number) {
    await this.prisma.selfEvaluationItem.deleteMany({
      where: { evaluationId: id },
    });

    return this.prisma.selfEvaluation.delete({
      where: { id },
    });
  }


}
