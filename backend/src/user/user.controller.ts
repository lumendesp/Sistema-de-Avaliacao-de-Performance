import { Controller, Get, Post, Put, Param, Body, ParseIntPipe } from '@nestjs/common';
import { UserService } from './user.service';
import { User, Evaluation, EvaluationType, EvaluationStatus } from '../../generated/prisma';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async getUsers(): Promise<User[]> {
    return this.userService.getUsers();
  }

  @Get(':id')
  async getUserById(@Param('id', ParseIntPipe) id: string): Promise<User> {
    return this.userService.getUserById(Number(id));
  }

  @Post()
  async createUser(
    @Body() data: { email: string; name: string }
  ): Promise<User> {
    return this.userService.createUser(data);
  }

  @Get('evaluations')
  async getEvaluations(): Promise<Evaluation[]> {
    return this.userService.getEvaluations();
  }

  @Post('evaluations')
  async createEvaluation(
    @Body()
    data: {
      evaluatedId: number;
      evaluatorId: number;
      type: EvaluationType;
      score: number;
      justification: string;
      deadline: Date;
    }
  ): Promise<Evaluation> {
    return this.userService.createEvaluation(data);
  }

  @Put('evaluations/:id')
  async updateEvaluation(
    @Param('id', ParseIntPipe) id: string,
    @Body()
    data: {
      score?: number;
      justification?: string;
      status?: EvaluationStatus;
    }
  ): Promise<Evaluation> {
    return this.userService.updateEvaluation(Number(id), data);
  }

  @Post(':userId/roles/:roleId')
  async assignRoleToUser(
    @Param('userId', ParseIntPipe) userId: string,
    @Param('roleId', ParseIntPipe) roleId: string
  ) {
    return this.userService.assignRoleToUser(Number(userId), Number(roleId));
  }
} 