import { Controller, Get, UseGuards, Query, NotFoundException, BadRequestException } from '@nestjs/common';
import { EvaluationCycleService } from './evaluation-cycle.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CycleStatus } from '@prisma/client';

@Controller('evaluation-cycle')
export class EvaluationCycleController {
  constructor(
    private readonly evaluationCycleService: EvaluationCycleService,
  ) {}

  // Retorna um ciclo com status específico (ex: IN_PROGRESS_COLLABORATOR)
  @UseGuards(JwtAuthGuard)
  @Get('active')
  async getActiveCycle(@Query('status') status?: string) {
    if (status && !Object.values(CycleStatus).includes(status as CycleStatus)) {
      throw new Error(`Invalid cycle status: ${status}`);
    }

    return this.evaluationCycleService.findActiveCycle(status as CycleStatus);
  }

  // Retorna ciclos fechados (excluindo o em progresso mais recente)
  @UseGuards(JwtAuthGuard)
  @Get('closed')
  getClosedCycles() {
    return this.evaluationCycleService.getClosedCycles();
  }

  // Retorna o ciclo mais recente (qualquer status)
  @UseGuards(JwtAuthGuard)
  @Get('recent')
  getMostRecentCycle() {
    return this.evaluationCycleService.getMostRecentCycle();
  }
}
