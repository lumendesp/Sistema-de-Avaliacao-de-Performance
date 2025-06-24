import { Controller, Get, Post, Put, Body, Param, ParseIntPipe } from '@nestjs/common';
import { CommitteeService } from './committee.service';

@Controller('committee')
export class CommitteeController {
  constructor(private readonly committeeService: CommitteeService) {}

  @Get('users')
  async getUsersWithEvaluations() {
    return this.committeeService.getUsersWithEvaluations();
  }

  @Post('evaluations')
  async createFinalEvaluation(@Body() data: { score: number; justification: string; evaluateeId: number; evaluatorId: number }) {
    return this.committeeService.createFinalEvaluation(data);
  }
} 