import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateReferenceDto } from './dto/create-reference.dto';
import { encrypt, decrypt } from '../utils/encryption';

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
