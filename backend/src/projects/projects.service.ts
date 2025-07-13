import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Project } from '@prisma/client';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<Project[]> {
    return this.prisma.project.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: number): Promise<Project> {
    const project = await this.prisma.project.findUnique({
      where: { id },
    });

    if (!project) {
      throw new NotFoundException(`Project with id ${id} not found`);
    }

    return project;
  }

  async create(data: { name: string; description?: string }): Promise<Project> {
    return this.prisma.project.create({
      data,
    });
  }

  async update(
    id: number,
    data: { name?: string; description?: string },
  ): Promise<Project> {
    await this.findOne(id); // garante que existe antes de atualizar

    return this.prisma.project.update({
      where: { id },
      data,
    });
  }

  async remove(id: number): Promise<Project> {
    await this.findOne(id); // garante que existe antes de remover

    return this.prisma.project.delete({
      where: { id },
    });
  }
}
