import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class CollaboratorsSearchBarService {
  constructor(private prisma: PrismaService) {}

  async findCollaborators(search: string) {
    return this.prisma.user.findMany({
      where: {
        roles: {
          some: {
            role: 'COLLABORATOR',
          },
        },
        OR: [
          { name: { contains: search } },
          { username: { contains: search } },
          { email: { contains: search } },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        photo: true,
      },
    });
  }
}
