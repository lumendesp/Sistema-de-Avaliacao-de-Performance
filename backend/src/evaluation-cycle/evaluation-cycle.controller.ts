import { Controller, Get, UseGuards } from '@nestjs/common';
import { EvaluationCycleService } from './evaluation-cycle.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('evaluation-cycle')
export class EvaluationCycleController {
  constructor(
    private readonly evaluationCycleService: EvaluationCycleService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('active')
  async getActiveCycle() {
    return this.evaluationCycleService.findActiveCycle();
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
