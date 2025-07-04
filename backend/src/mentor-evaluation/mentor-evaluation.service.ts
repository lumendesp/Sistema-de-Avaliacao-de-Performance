import * as crypto from 'crypto';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { EvaluationCycleService } from '../evaluation-cycle/evaluation-cycle.service';
import { CreateMentorEvaluationDto } from './dto/create-mentor-evaluation.dto';
import { encrypt, decrypt } from '../utils/encryption';

@Injectable()
export class MentorEvaluationService {
  constructor(
    private prisma: PrismaService,
    private cycleService: EvaluationCycleService, // necessário para buscar informações sobre o ciclo ativo
  ) {}

  // função para criar uma avaliação para o mentor
  async create(evaluatorId: number, dto: CreateMentorEvaluationDto) {
    // busca o usuário no banco, o que vai fazer a avaliação
    const user = await this.prisma.user.findUnique({
      where: { id: evaluatorId },
      include: { roles: true },
    });

    // verifica se o avaliador é um colaborador, pq só colaboradores fazem esse tipo de avaliação
    const isCollaborator = user?.roles.some((r) => r.role === 'COLLABORATOR');
    if (!isCollaborator) {
      throw new ForbiddenException('Only collaborators can evaluate mentors.');
    }

    // busca o ciclo de avaliação ativo
    const activeCycle = await this.cycleService.findActiveCycle();

    // se não tiver nenhum ciclo ativo
    if (!activeCycle) {
      throw new Error('No active evaluation cycle found');
    }

    // verifica se já existe avaliação do mesmo avaliador para o mesmo mentor nesse ciclo (pq não pode fazer a mesma avalição, no mesmo ciclo, mais de uma vez, depois que ela foi enviada)
    const existing = await this.prisma.mentorEvaluation.findFirst({
      where: {
        evaluatorId,
        evaluateeId: dto.evaluateeId,
        cycleId: activeCycle.id,
      },
    });

    // se já existe uma avaliação
    if (existing) {
      throw new ForbiddenException(
        'You have already evaluated this mentor in this cycle.',
      );
    }

    // cria a avaliação no banco de dados
    return this.prisma.mentorEvaluation.create({
      data: {
        evaluatorId,
        evaluateeId: dto.evaluateeId,
        cycleId: activeCycle.id,
        score: dto.score,
        justification: encrypt(dto.justification),
      },
    });
  }

  // busca todas as avaliações recebidas por um mentor, por ciclo ou não (por enquanto, não temos a lógica de ciclos certinha)
  async findEvaluationsForMentor(mentorId: number, cycleId?: number) {
    const results = await this.prisma.mentorEvaluation.findMany({
      where: {
        evaluateeId: mentorId,
        ...(cycleId ? { cycleId } : {}), // adiciona filtro por cycleId se existir
      },
      include: {
        evaluator: { select: { id: true, name: true, roles: true } },
        cycle: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return results.map((ev) => ({
      ...ev,
      justification: decrypt(ev.justification),
    }));
  }

  // busca todas as avaliações enviadas por um usuário, por ciclo ou não (por enquanto, não temos a lógica de ciclos certinha)
  async findEvaluationsByUser(userId: number, cycleId?: number) {
    const results = await this.prisma.mentorEvaluation.findMany({
      where: {
        evaluatorId: userId,
        ...(cycleId ? { cycleId } : {}),
      },
      include: {
        evaluatee: { select: { id: true, name: true, roles: true } },
        cycle: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return results.map((ev) => ({
      ...ev,
      justification: decrypt(ev.justification),
    }));
  }

  // função para verificar se já existe alguma avaliação feita por um usuário para um mentor específico
  async findByEvaluatorAndEvaluatee(
    evaluatorId: number,
    evaluateeId: number,
    cycleId?: number,
  ) {
    const result = await this.prisma.mentorEvaluation.findFirst({
      where: {
        evaluatorId,
        evaluateeId,
        ...(cycleId ? { cycleId } : {}),
      },
      include: {
        cycle: true,
      },
    });
    if (!result) return null;
    return { ...result, justification: decrypt(result.justification) };
  }
}
