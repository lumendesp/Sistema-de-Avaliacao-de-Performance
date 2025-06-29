import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // função para criar um novo usuário
  async create(createUserDto: CreateUserDto) {
    // aqui é a senha sendo criptografada antes de ser salva no banco
    // 10 significa 10 rounds de salt, é basicamente a quantidade de ciclos que o algoritmo vai dar para gerar o hash, é a força da criptografia
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // cria o usuário no banco
    const user = await this.prisma.user.create({
      data: {
        ...createUserDto, // os campos do dto
        password: hashedPassword, // a senha já com hash
        roles: {
          // as roles são salvas numa tabela separada
          create: createUserDto.roles.map((r) => ({ role: r.role })),
        },
      },
      include: { roles: true },
    });
    return user;
  }

  // função que retorna todos os usuários
  async findAll() {
    return this.prisma.user.findMany({
      include: { roles: true },
    });
  }

  // função para buscar um usuário pelo id
  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { roles: true },
    });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user;
  }

  // função para atualizar campos do usuário
  async update(id: number, updateUserDto: UpdateUserDto) {
    // campos que podem ser atualizados
    const dataToUpdate: any = {
      name: updateUserDto.name,
      email: updateUserDto.email,
      username: updateUserDto.username,
      active: updateUserDto.active,
      photo: updateUserDto.photo,
      positionId: updateUserDto.positionId,
      unitId: updateUserDto.unitId,
      trackId: updateUserDto.trackId,
    };

    // se tiver senha no dto para ser atualizada, deve ser criptografada novamente
    if (updateUserDto.password) {
      dataToUpdate.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    // se tiver roles no dto para serem atualizadas, vão ser atualizadas de forma separada
    if (updateUserDto.roles) {
      // primeiro remove as roles antigas
      await this.prisma.userRole.deleteMany({
        where: { userId: id },
      });

      // agora adiciona as novas roles, ou seja, se quiser manter as roles antigas e adicionar novas, deve incluir elas no patch também
      dataToUpdate.roles = {
        create: updateUserDto.roles.map((roleDto) => ({
          role: roleDto.role,
        })),
      };
    }

    // Atualiza o usuário com dados básicos + roles (se houve update)
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: dataToUpdate,
      include: { roles: true }, // para retornar com roles
    });

    return updatedUser;
  }

  // função para remover um usuário
  async remove(id: number) {
    await this.prisma.user.delete({
      where: { id },
    });
    return { message: `User ${id} deleted` };
  }

  // função para buscar usuários com suas avaliações (para o comitê)
  async findUsersWithEvaluations() {
    const users = await this.prisma.user.findMany({
      include: {
        roles: true,
        peerEvaluationsReceived: {
          include: {
            evaluator: { select: { id: true, name: true } },
            cycle: true,
          },
        },
        managerEvaluationsReceived: {
          include: {
            evaluator: { select: { id: true, name: true } },
            cycle: true,
            items: true,
          },
        },
        finalScores: {
          include: {
            cycle: true,
            adjuster: { select: { id: true, name: true } },
          },
        },
      },
    });

    // Transform the data to match the frontend expectations
    return users.map(user => {
      const evaluationsEvaluated = [
        // Peer evaluations
        ...user.peerEvaluationsReceived.map(evaluation => ({
          id: evaluation.id,
          type: 'PEER',
          score: evaluation.score,
          justification: evaluation.strengths + ' ' + evaluation.improvements,
          evaluator: evaluation.evaluator,
          cycle: evaluation.cycle,
        })),
        // Manager evaluations
        ...user.managerEvaluationsReceived.map(evaluation => ({
          id: evaluation.id,
          type: 'MANAGER',
          score: evaluation.items.reduce((sum, item) => sum + item.score, 0) / evaluation.items.length || 0,
          justification: evaluation.items.map(item => item.justification).join(' '),
          evaluator: evaluation.evaluator,
          cycle: evaluation.cycle,
        })),
        // Final evaluations
        ...user.finalScores.map(evaluation => ({
          id: evaluation.id,
          type: 'FINAL',
          score: evaluation.finalScore || 0,
          justification: evaluation.justification,
          evaluator: evaluation.adjuster,
          cycle: evaluation.cycle,
        })),
      ];

      const hasAllEvaluations = user.peerEvaluationsReceived.length > 0 && 
                               user.managerEvaluationsReceived.length > 0 && 
                               user.finalScores.length > 0;

      return {
        ...user,
        evaluationsEvaluated,
        hasAllEvaluations,
      };
    });
  }
}
