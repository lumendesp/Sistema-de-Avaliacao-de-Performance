import { UpdateReferenceDto } from './dto/update-reference.dto';
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
  async updateReference(
    referenceId: number,
    providerId: number,
    dto: UpdateReferenceDto,
  ) {
    console.log(referenceId);
    console.log(providerId);
    const reference = await this.prisma.reference.findUnique({
      where: { id: referenceId },
      include: {
        cycle: true,
      },
    });

    if (!reference) {
      throw new BadRequestException('Referência não encontrada.');
    }

    if (reference.providerId !== providerId) {
      throw new BadRequestException(
        'Você não tem permissão para editar esta referência.',
      );
    }

    const now = new Date();
    const endDate = new Date(reference.cycle.endDate);

    if (now > endDate) {
      throw new BadRequestException(
        'O ciclo está finalizado. Não é possível editar esta referência.',
      );
    }

    const updated = await this.prisma.reference.update({
      where: { id: referenceId },
      data: {
        justification: encrypt(dto.justification),
      },
    });
    return {
      ...updated,
      justification: decrypt(updated.justification),
    };
  }

  async deleteReference(referenceId: number, providerId: number) {
    const reference = await this.prisma.reference.findUnique({
      where: { id: referenceId },
      include: { cycle: true },
    });

    if (!reference) {
      throw new BadRequestException('Referência não encontrada.');
    }

    if (reference.providerId !== providerId) {
      throw new BadRequestException(
        'Você não tem permissão para deletar esta referência.',
      );
    }

    const now = new Date();
    if (new Date(reference.cycle.endDate) < now) {
      throw new BadRequestException(
        'Ciclo finalizado. Não é possível apagar esta referência.',
      );
    }

    return this.prisma.reference.delete({
      where: { id: referenceId },
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
