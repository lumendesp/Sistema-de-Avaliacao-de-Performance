import { Controller, Get, Query, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Controller('user-profile')
export class UserProfileController {
  @Get()
  async getProfile(@Query('email') email: string) {
    if (!email) throw new NotFoundException('Email é obrigatório');
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        roles: true,
        position: true,
        unit: true,
      },
    });
    if (!user) throw new NotFoundException('Usuário não encontrado');
    return {
      name: user.name,
      email: user.email,
      roles: user.roles.map(r => r.role),
      position: user.position?.name ?? null,
      unit: user.unit?.name ?? null,
    };
  }
}
