import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ManagerSearchBarService {
  constructor(private prisma: PrismaService) {}

  async findManagerCollaborators(managerId: number, search: string) {
    // Busca os colaboradores gerenciados por esse manager e filtra pelo termo
    return this.prisma.user.findMany({
      where: {
        managedBy: {
          some: {
            managerId: managerId,
          },
        },
        OR: [
          { name: { startsWith: search } },
          { username: { startsWith: search } },
          { email: { startsWith: search } },
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
