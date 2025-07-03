import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateManagerEvaluationDto } from './dto/create-manager-evaluation.dto';
import { UpdateManagerEvaluationDto } from './dto/update-manager-evaluation.dto';
import * as crypto from 'crypto';

const ENCRYPTION_KEY =
  process.env.EVAL_ENCRYPT_KEY?.padEnd(32, '0').slice(0, 32) ||
  '12345678901234567890123456789012'; // 32 bytes
const IV_LENGTH = 16;

function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(
    'aes-256-cbc',
    Buffer.from(ENCRYPTION_KEY),
    iv,
  );
  let encrypted = cipher.update(text, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  return iv.toString('base64') + ':' + encrypted;
}

function decrypt(text: string): string {
  if (!text) return '';
  const [ivStr, encrypted] = text.split(':');
  const iv = Buffer.from(ivStr, 'base64');
  const decipher = crypto.createDecipheriv(
    'aes-256-cbc',
    Buffer.from(ENCRYPTION_KEY),
    iv,
  );
  let decrypted = decipher.update(encrypted, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

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
    // Salva o groupId em cada item
    return this.prisma.managerEvaluation.create({
      data: {
        evaluatorId,
        evaluateeId: dto.evaluateeId,
        cycleId: dto.cycleId,
        items: {
          create: dto.groups.flatMap((group) =>
            group.items.map((item) => ({
              criterion: { connect: { id: item.criterionId } },
              score: item.score,
              justification: encrypt(item.justification || ''), // justification criptografada
              scoreDescription: this.getScoreDescription(item.score),
              groupId: group.groupId,
            })),
          ),
        },
      },
      include: { items: true },
    });
  }

  async update(id: number, dto: UpdateManagerEvaluationDto) {
    const groups = (dto as any).groups;
    return this.prisma.managerEvaluation.update({
      where: { id },
      data: {
        ...(groups && {
          items: {
            deleteMany: {},
            create: groups.flatMap((group) =>
              group.items.map((item) => ({
                criterion: { connect: { id: item.criterionId } },
                score: item.score, // score como number
                justification: encrypt(item.justification || ''), // justification criptografada
                scoreDescription: this.getScoreDescription(item.score),
                groupId: group.groupId,
              })),
            ),
          },
        }),
      },
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

  async findByEvaluatorAndEvaluatee(evaluatorId: number, evaluateeId: number) {
    const evaluation = await this.prisma.managerEvaluation.findFirst({
      where: { evaluatorId, evaluateeId },
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
