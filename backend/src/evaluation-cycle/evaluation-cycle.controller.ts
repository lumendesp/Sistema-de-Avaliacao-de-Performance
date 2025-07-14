import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { EvaluationCycleService } from './evaluation-cycle.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CycleStatus } from '@prisma/client';

@Controller('evaluation-cycle')
export class EvaluationCycleController {
  constructor(
    private readonly evaluationCycleService: EvaluationCycleService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('active')
  async getActiveCycle(@Query('status') status?: string) {
    // Validar se o status é válido
    if (status && !Object.values(CycleStatus).includes(status as CycleStatus)) {
      throw new Error(`Invalid cycle status: ${status}`);
    }
    
    return this.evaluationCycleService.findActiveCycle(status as CycleStatus);
  }

  @Get('closed')
  getClosedCycles() {
    return this.evaluationCycleService.getClosedCycles();
  }

  @UseGuards(JwtAuthGuard)
  @Get('recent')
  getMostRecentCycle() {
    return this.evaluationCycleService.getMostRecentCycle();
  }
}
