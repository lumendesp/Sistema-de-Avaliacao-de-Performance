import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreatePeerEvaluationDto } from './dto/create-peer-evaluation.dto';
import * as crypto from 'crypto';

const ENCRYPTION_KEY =
  process.env.EVAL_ENCRYPT_KEY?.padEnd(32, '0').slice(0, 32) ||
  '12345678901234567890123456789012';
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
export class PeerEvaluationService {
  constructor(private prisma: PrismaService) {}

  async create(evaluatorId: number, dto: CreatePeerEvaluationDto) {
    const { evaluateeId, cycleId, projects, ...evaluationData } = dto;

    // Verifica se avaliador existe
    const evaluatorExists = await this.prisma.user.findUnique({
      where: { id: evaluatorId },
    });
    if (!evaluatorExists) {
      throw new NotFoundException('Evaluator user not found');
    }

    // Verifica se avaliado existe
    const evaluateeExists = await this.prisma.user.findUnique({
      where: { id: evaluateeId },
    });
    if (!evaluateeExists) {
      throw new NotFoundException('Evaluatee user not found');
    }

    // Avaliador não pode avaliar ele mesmo
    if (evaluatorId === evaluateeId) {
      throw new BadRequestException('Evaluator cannot evaluate themselves');
    }

    // Verifica se já existe avaliação do mesmo avaliador para o mesmo avaliado e ciclo
    const existingEvaluation = await this.prisma.peerEvaluation.findFirst({
      where: {
        evaluatorId,
        evaluateeId,
        cycleId,
      },
    });
    if (existingEvaluation) {
      throw new BadRequestException(
        'Evaluation for this evaluatee in this cycle by the evaluator already exists',
      );
    }

    // Valida se todos os projetos existem antes de criar a avaliação
    const validatedProjects: { projectId: number; period: number }[] = [];
    if (projects && projects.length > 0) {
      for (const proj of projects) {
        const projectInDb = await this.prisma.project.findUnique({
          where: { name: proj.name },
        });

        if (!projectInDb) {
          throw new NotFoundException(
            `Project with name "${proj.name}" not found`,
          );
        }

        validatedProjects.push({
          projectId: projectInDb.id,
          period: proj.period,
        });
      }
    }

    // Cria avaliação
    const evaluation = await this.prisma.peerEvaluation.create({
      data: {
        ...evaluationData,
        strengths: encrypt(evaluationData.strengths),
        improvements: encrypt(evaluationData.improvements),
        motivation: evaluationData.motivation,
        evaluatorId,
        evaluateeId,
        cycleId,
      },
    });

    // Cria associações de projetos relacionados (se houver)
    if (validatedProjects.length > 0) {
      for (const validatedProj of validatedProjects) {
        await this.prisma.peerEvaluationProject.create({
          data: {
            peerEvaluationId: evaluation.id,
            projectId: validatedProj.projectId,
            period: validatedProj.period,
          },
        });
      }
    }

    // Retorna avaliação com dados relacionados
    return this.prisma.peerEvaluation.findUnique({
      where: { id: evaluation.id },
      include: {
        projects: {
          include: {
            project: true,
          },
        },
        evaluatee: true,
        evaluator: true,
      },
    });
  }

  findByEvaluatorInCycle(evaluatorId: number, cycleId: number) {
    return this.prisma.peerEvaluation
      .findMany({
        where: {
          evaluatorId,
          cycleId,
        },
        include: {
          evaluatee: true,
          projects: {
            include: {
              project: true,
            },
          },
        },
      })
      .then((evals) =>
        evals.map((ev) => ({
          ...ev,
          strengths: decrypt(ev.strengths),
          improvements: decrypt(ev.improvements),
          motivation: ev.motivation,
        })),
      );
  }

  findByEvaluateeInCycle(cycleId: number, evaluateeId: number) {
    return this.prisma.peerEvaluation
      .findMany({
        where: {
          evaluateeId,
          cycleId,
        },
        include: {
          evaluator: true,
          projects: {
            include: {
              project: true,
            },
          },
        },
      })
      .then((evals) =>
        evals.map((ev) => ({
          ...ev,
          strengths: decrypt(ev.strengths),
          improvements: decrypt(ev.improvements),
          motivation: ev.motivation,
        })),
      );
  }

  findOne(id: number) {
    return this.prisma.peerEvaluation
      .findUnique({
        where: { id },
        include: {
          evaluator: true,
          evaluatee: true,
          projects: {
            include: {
              project: true,
            },
          },
          cycle: true,
        },
      })
      .then((ev) =>
        ev
          ? {
              ...ev,
              strengths: decrypt(ev.strengths),
              improvements: decrypt(ev.improvements),
              motivation: ev.motivation,
            }
          : null,
      );
  }

  remove(id: number) {
    return this.prisma.peerEvaluation.delete({
      where: { id },
    });
  }
}
