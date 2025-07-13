import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { EvaluationCycleService } from './evaluation-cycle.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Role } from '@prisma/client';

@Controller('evaluation-cycle')
export class EvaluationCycleController {
  constructor(
    private readonly evaluationCycleService: EvaluationCycleService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('active')
  async getActiveCycle(@Query('type') type?: string) {
    // Validar se o tipo é válido
    if (type && !Object.values(Role).includes(type as Role)) {
      throw new Error(`Invalid role type: ${type}`);
    }
    
    return this.evaluationCycleService.findActiveCycle(type as Role);
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
