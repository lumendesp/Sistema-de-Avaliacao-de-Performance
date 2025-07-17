import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

import { BadRequestException, NotFoundException } from '@nestjs/common';

@Injectable()
export class MentorService {
  constructor(private prisma: PrismaService) {}

  // função para buscar todos os usuários que possuem pelo menos o papel "MENTOR"
  async findAll() {
    return this.prisma.user.findMany({
      where: {
        roles: {
          some: {
            role: 'MENTOR',
          },
        },
      },
      // retorna esses campos do usuário
      select: {
        id: true,
        name: true,
        email: true,
        roles: true,
      },
    });
  }

  // função para buscar um mentor pelo id dele, e retornar também os seus mentorados
  async getMentorWithMentees(mentorId: number) {
    const mentor = await this.prisma.user.findUnique({
      where: { id: mentorId },
      include: {
        mentees: true,
        roles: true,
      },
    });

    // se não encontrar ninguém com o id informado
    if (!mentor) {
      throw new NotFoundException('User not found');
    }

    const hasMentorRole = mentor.roles.some((r) => r.role === 'MENTOR');

    // se o usuário não possui o papel de mentor
    if (!hasMentorRole) {
      throw new BadRequestException('This user does not have the MENTOR role');
    }

    return mentor;
  }

  // função para atribuir um mentor a um mentorado
  async assignMentee(mentorId: number, userId: number) {
    // verifica se não está tentando atribuir um mentor a ele mesmo
    if (mentorId === userId) {
      throw new BadRequestException(
        'A mentor cannot be assigned to themselves',
      );
    }

    // busca o usuário que vai receber o mentor
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: true,
      },
    });

    // se o usuário não existir
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // garante que o usuário tenha o papel COLLABORATOR
    const isCollaborator = user.roles.some((r) => r.role === 'COLLABORATOR');
    if (!isCollaborator) {
      throw new BadRequestException(
        'Only collaborators can be assigned a mentor',
      );
    }

    // verifica se o usuário já tem um mentor atribuído, pq ele não pode ter 2 ao mesmo tempo
    if (user.mentorId && user.mentorId !== mentorId) {
      throw new BadRequestException(
        'This user already has a mentor assigned. Please unassign the current mentor first.',
      );
    }

    // verifica se o mentor já está atribuído a esse usuário
    if (user.mentorId === mentorId) {
      return { message: 'This mentor is already assigned to this user.' };
    }

    // busca o mentor
    const mentor = await this.prisma.user.findUnique({
      where: { id: mentorId },
      include: { roles: true },
    });

    // se o mentor não existir no banco
    if (!mentor) {
      throw new NotFoundException('Mentor not found');
    }

    const hasMentorRole = mentor.roles.some((r) => r.role === 'MENTOR');

    // se o mentor não tiver um papel de mentor
    if (!hasMentorRole) {
      throw new BadRequestException('The specified user is not a mentor');
    }

    // finalmente, atualiza o usuário, atribuindo o id do mentor a ele
    await this.prisma.user.update({
      where: { id: userId },
      data: { mentorId },
    });

    return { message: 'Mentor successfully assigned.' };
  }

  // função para remover um mentor de um usuário
  async unassignMentee(mentorId: number, userId: number) {
    // busca o usuário no banco
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    // se o usuário não existit
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // verifica se o mentor está realmente atribuído a esse usuário
    if (user.mentorId !== mentorId) {
      throw new BadRequestException(
        'This user is not assigned to the specified mentor',
      );
    }

    // busca o mentor no banco
    const mentor = await this.prisma.user.findUnique({
      where: { id: mentorId },
      include: { roles: true },
    });

    // se o mentor não existir
    if (!mentor) {
      throw new NotFoundException('Mentor not found');
    }

    const hasMentorRole = mentor.roles.some((r) => r.role === 'MENTOR');

    // verifica se o mentor realmente tem papel de mentor
    if (!hasMentorRole) {
      throw new BadRequestException('The specified user is not a mentor');
    }

    // finalmente, remove o mentor do usuário, setando para null o mentorId
    return this.prisma.user.update({
      where: { id: userId },
      data: { mentorId: null },
    });
  }
}
