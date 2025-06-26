import {
  Controller,
  Get,
  Req,
  UseGuards,
  Param,
  Patch,
  ParseIntPipe,
  Body,
  Post,
} from '@nestjs/common';
import { ManagerEvaluationService } from './manager-evaluation.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('manager/evaluation')
export class ManagerEvaluationController {
  constructor(
    private readonly managerEvaluationService: ManagerEvaluationService,
  ) {}

  @Get('by-manager')
  async findByManager(@Req() req) {
    const evaluatorId = req.user.userId;
    return this.managerEvaluationService.findByManager(evaluatorId);
  }

  @Get('by-evaluatee/:id')
  async findByEvaluatee(@Param('id', ParseIntPipe) id: number) {
    return this.managerEvaluationService.findByEvaluatee(id);
  }

  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: any) {
    return this.managerEvaluationService.update(id, dto);
  }

  @Post('generate-all/:cycleId')
  async generateAll(@Param('cycleId', ParseIntPipe) cycleId: number) {
    return this.managerEvaluationService.generateAllForCycle(cycleId);
  }

  @Patch('submit/:id')
  async submit(@Param('id', ParseIntPipe) id: number) {
    return this.managerEvaluationService.submit(id);
  }
}
