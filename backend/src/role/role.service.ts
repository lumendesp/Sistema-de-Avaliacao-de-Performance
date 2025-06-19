import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { RoleType } from '../../generated/prisma';

@Injectable()
export class RoleService {
  constructor(private prisma: PrismaService) {}

  async createRole(type: string) {
    const validTypes = ['EMPLOYEE', 'MANAGER', 'COMMITTEE', 'HR'];
    const normalizedType = type.toUpperCase();

    if (!validTypes.includes(normalizedType)) {
      throw new BadRequestException(`Invalid role type: ${type}`);
    }

    return this.prisma.role.create({
      data: { type: RoleType[normalizedType as keyof typeof RoleType] },
    });
  }
}
