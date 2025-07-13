import { Controller, Get, UseGuards, Query, NotFoundException, BadRequestException } from '@nestjs/common';
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
      throw new BadRequestException(`Invalid role type: ${type}`);
    }
    
    const activeCycle = await this.evaluationCycleService.findActiveCycle(type as Role);
    
    if (!activeCycle) {
      if (type === Role.COMMITTEE) {
        throw new NotFoundException('No closed evaluation cycle available for committee equalization. Please wait for the evaluation cycle to be closed and released to the committee.');
      } else {
        throw new NotFoundException(`No active evaluation cycle found for type: ${type || 'any'}`);
      }
    }
    
    return activeCycle;
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
