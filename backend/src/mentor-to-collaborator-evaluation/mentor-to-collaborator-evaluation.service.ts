import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateMentorToCollaboratorEvaluationDto } from './dto/create-mentor-to-collaborator-evaluation.dto';
import { encrypt, decrypt } from '../utils/encryption';

@Injectable()
export class MentorToCollaboratorEvaluationService {
  constructor(private prisma: PrismaService) {}

  async create(
    evaluatorId: number,
    roles: string[],
    dto: CreateMentorToCollaboratorEvaluationDto,
  ) {
    // Permissão: apenas MENTOR ou ADMIN podem criar avaliação
    if (!roles.includes('MENTOR') && !roles.includes('ADMIN')) {
      throw new ForbiddenException(
        'Apenas mentores ou administradores podem enviar esta avaliação.',
      );
    }
    // Verifica se já existe avaliação do mesmo mentor para o mesmo colaborador no mesmo ciclo
    const existing = await this.prisma.mentorToCollaboratorEvaluation.findFirst(
      {
        where: {
          evaluatorId,
          evaluateeId: dto.evaluateeId,
          cycleId: dto.cycleId,
        },
      },
    );
    if (existing) {
      // Atualiza a avaliação existente em vez de bloquear
      return this.prisma.mentorToCollaboratorEvaluation.update({
        where: { id: existing.id },
        data: {
          score: dto.score,
          justification: encrypt(dto.justification),
          createdAt: new Date(),
          status: dto.status ?? existing.status ?? 'draft',
        },
      });
    }
    return this.prisma.mentorToCollaboratorEvaluation.create({
      data: {
        evaluatorId,
        evaluateeId: dto.evaluateeId,
        cycleId: dto.cycleId,
        score: dto.score,
        justification: encrypt(dto.justification),
        status: dto.status ?? 'draft',
      },
    });
  }

  async getByMentor(mentorId: number) {
    const results = await this.prisma.mentorToCollaboratorEvaluation.findMany({
      where: { evaluatorId: mentorId },
      include: { evaluatee: true, cycle: true },
      orderBy: { createdAt: 'desc' },
    });
    return results.map((ev) => ({
      ...ev,
      justification: decrypt(ev.justification),
    }));
  }

  async getByCollaborator(collaboratorId: number) {
    const results = await this.prisma.mentorToCollaboratorEvaluation.findMany({
      where: { evaluateeId: collaboratorId },
      include: { evaluator: true, cycle: true },
      orderBy: { createdAt: 'desc' },
    });
    return results.map((ev) => ({
      ...ev,
      justification: decrypt(ev.justification),
    }));
  }
}
