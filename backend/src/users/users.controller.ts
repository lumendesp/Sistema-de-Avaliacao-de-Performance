import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // cria um novo usuário no formato do CreateUserDto
  @Post()
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return await this.usersService.create(createUserDto);
  }

  // retorna todos os usuários do banco
  @Get()
  async findAll(): Promise<User[]> {
    return await this.usersService.findAll();
  }

  // retorna colaboradores com dados de avaliação para o dashboard
  @Get('collaborators/dashboard')
  async findCollaboratorsForDashboard() {
    return await this.usersService.findCollaboratorsForDashboard();
  }

  // retorna usuários com suas avaliações (para o comitê)
  @Get('evaluations')
  @UseGuards(JwtAuthGuard)
  async findUsersWithEvaluations() {
    return await this.usersService.findUsersWithEvaluations();
  }

  // retorna um usuário em específico, de acordo com o id
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<User> {
    return await this.usersService.findOne(+id);
  }

  // atualiza alguns (ou todos) campos de um usuário, de acordo com o id
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return await this.usersService.update(+id, updateUserDto);
  }

  // remove um usuário do banco
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    return await this.usersService.remove(+id);
  }
}
