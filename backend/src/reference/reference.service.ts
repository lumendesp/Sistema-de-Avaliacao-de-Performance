import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateReferenceDto } from './dto/create-reference.dto';
import * as crypto from 'crypto';

const ENCRYPTION_KEY = (
  process.env.EVAL_ENCRYPT_KEY || '12345678901234567890123456789012'
)
  .padEnd(32, '0')
  .slice(0, 32);
const IV_LENGTH = 16;

function encrypt(text: string): string {
  if (!text) return text;
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
  if (!text) return text;
  const [ivBase64, encrypted] = text.split(':');
  if (!ivBase64 || !encrypted) return text;
  const iv = Buffer.from(ivBase64, 'base64');
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
export class ReferenceService {
  constructor(private readonly prisma: PrismaService) {}

  async createReference(providerId: number, dto: CreateReferenceDto) {
    const { receiverId, cycleId, justification } = dto;
    const existing = await this.prisma.reference.findFirst({
      where: {
        providerId,
        receiverId,
        cycleId,
      },
    });
    if (existing) {
      throw new BadRequestException(
        'You have already added a reference to this person in this cycle.',
      );
    }
    return this.prisma.reference.create({
      data: {
        providerId,
        receiverId,
        cycleId,
        justification: encrypt(justification),
      },
    });
  }

  async getReferencesByCycle(cycleId: number) {
    const refs = await this.prisma.reference.findMany({
      where: { cycleId },
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            email: true,
            photo: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            email: true,
            photo: true,
          },
        },
      },
    });
    return refs.map((ref) => ({
      ...ref,
      justification: decrypt(ref.justification),
    }));
  }

  async getSentReferencesByCycle(cycleId: number, userId: number) {
    const refs = await this.prisma.reference.findMany({
      where: {
        cycleId,
        providerId: userId,
      },
      include: {
        receiver: {
          select: {
            id: true,
            name: true,
            email: true,
            photo: true,
          },
        },
      },
    });
    return refs.map((ref) => ({
      ...ref,
      justification: decrypt(ref.justification),
    }));
  }

  async getReceivedReferencesByCycle(cycleId: number, userId: number) {
    const refs = await this.prisma.reference.findMany({
      where: {
        cycleId,
        receiverId: userId,
      },
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            email: true,
            photo: true,
          },
        },
      },
    });
    return refs.map((ref) => ({
      ...ref,
      justification: decrypt(ref.justification),
    }));
  }

  async findAllByProviderAndCycle(providerId: number, cycleId: number) {
    const refs = await this.prisma.reference.findMany({
      where: { providerId, cycleId },
      include: {
        receiver: true, // traz dados do colaborador que recebeu a referência
      },
    });
    return refs.map((ref) => ({
      ...ref,
      justification: decrypt(ref.justification),
    }));
  }
}
