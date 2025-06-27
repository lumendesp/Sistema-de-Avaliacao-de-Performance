import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ManagerService {
  constructor(private prisma: PrismaService) {}

  // Lista todos os usuários com papel de manager
  async findAll() {
    return this.prisma.user.findMany({
      where: {
        roles: {
          some: { role: 'MANAGER' },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        roles: true,
      },
    });
  }

  // Retorna o manager e seus colaboradores
  async getManagerWithCollaborators(managerId: number) {
    const manager = await this.prisma.user.findUnique({
      where: { id: managerId },
      include: {
        manages: {
          include: {
            collaborator: {
              select: { id: true, name: true, email: true, roles: true },
            },
          },
        },
        roles: true,
      },
    });
    if (!manager) throw new NotFoundException('Manager not found');
    const hasManagerRole = manager.roles.some((r) => r.role === 'MANAGER');
    if (!hasManagerRole)
      throw new BadRequestException('This user does not have the MANAGER role');
    // Retorna apenas os dados do manager e a lista de colaboradores
    return {
      id: manager.id,
      name: manager.name,
      username: manager.username,
      email: manager.email,
      active: manager.active,
      photo: manager.photo,
      positionId: manager.positionId,
      unitId: manager.unitId,
      trackId: manager.trackId,
      roles: manager.roles,
      collaborators: manager.manages.map((mc) => mc.collaborator),
    };
  }

  // Associa um colaborador a um manager
  async assignCollaborator(managerId: number, userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { roles: true },
    });
    if (!user) throw new NotFoundException('User not found');
    const isCollaborator = user.roles.some((r) => r.role === 'COLLABORATOR');
    if (!isCollaborator)
      throw new BadRequestException(
        'Only collaborators can be assigned to a manager',
      );
    const manager = await this.prisma.user.findUnique({
      where: { id: managerId },
      include: { roles: true },
    });
    if (!manager) throw new NotFoundException('Manager not found');
    const hasManagerRole = manager.roles.some((r) => r.role === 'MANAGER');
    if (!hasManagerRole)
      throw new BadRequestException('The specified user is not a manager');
    const existing = await this.prisma.managerCollaborator.findUnique({
      where: {
        managerId_collaboratorId: { managerId, collaboratorId: userId },
      },
    });
    if (existing)
      return { message: 'This manager is already assigned to this user.' };
    await this.prisma.managerCollaborator.create({
      data: { managerId, collaboratorId: userId },
    });
    return { message: 'Collaborator successfully assigned.' };
  }

  // Remove a associação de um colaborador com um manager
  async unassignCollaborator(managerId: number, userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    const manager = await this.prisma.user.findUnique({
      where: { id: managerId },
      include: { roles: true },
    });
    if (!manager) throw new NotFoundException('Manager not found');
    const hasManagerRole = manager.roles.some((r) => r.role === 'MANAGER');
    if (!hasManagerRole)
      throw new BadRequestException('The specified user is not a manager');
    const existing = await this.prisma.managerCollaborator.findUnique({
      where: {
        managerId_collaboratorId: { managerId, collaboratorId: userId },
      },
    });
    if (!existing)
      throw new BadRequestException(
        'This user is not assigned to the specified manager',
      );
    await this.prisma.managerCollaborator.delete({
      where: {
        managerId_collaboratorId: { managerId, collaboratorId: userId },
      },
    });
    return { message: 'Collaborator unassigned from manager.' };
  }
}
