import {
  Controller,
  Post,
  Body,
  Get,
  Req,
  UseGuards,
  Param,
  Patch,
  ParseIntPipe,
} from '@nestjs/common';
import { ManagerEvaluationService } from './manager-evaluation.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('manager/evaluation')
export class ManagerEvaluationController {
  constructor(
    private readonly managerEvaluationService: ManagerEvaluationService,
  ) {}

  @Post()
  async create(@Req() req, @Body() dto: any) {
    const evaluatorId = req.user.sub;
    return this.managerEvaluationService.create(evaluatorId, dto);
  }

  @Get('by-manager')
  async findByManager(@Req() req) {
    const evaluatorId = req.user.sub;
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
}
