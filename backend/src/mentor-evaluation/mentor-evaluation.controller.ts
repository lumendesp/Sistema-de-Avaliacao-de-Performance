import {
  Controller,
  Param,
  ParseIntPipe,
  Query,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  Req,
  Patch,
} from '@nestjs/common';
import { MentorEvaluationService } from './mentor-evaluation.service';
import { CreateMentorEvaluationDto } from './dto/create-mentor-evaluation.dto';
import { UpdateMentorEvaluationDto } from './dto/update-mentor-evaluation.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { EvaluationCycleService } from '../evaluation-cycle/evaluation-cycle.service';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('mentor-evaluations')
export class MentorEvaluationController {
  constructor(
    private readonly mentorEvaluationService: MentorEvaluationService,
    private readonly cycleService: EvaluationCycleService,
  ) {}

  // criar uma avaliação
  @Post()
  async create(@Body() dto: CreateMentorEvaluationDto, @Request() req) {
    const evaluatorId = req.user.userId; // id do usuário autenticado, que está armazenado no token e disponível em req.user
    return this.mentorEvaluationService.create(evaluatorId, dto);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMentorEvaluationDto,
    @Request() req,
  ) {
    const evaluatorId = req.user.userId;
    return this.mentorEvaluationService.update(evaluatorId, id, dto);
  }

  // retorna as avaliações recebidas de um mentor
  @Get('received/:mentorId')
  @ApiQuery({
    name: 'cycleId',
    required: false,
    type: Number,
    description: 'Filter by evaluation cycle (optional)',
  })
  async getEvaluationsForMentor(
    @Param('mentorId', ParseIntPipe) mentorId: number,
    @Query('cycleId') cycleId?: string,
  ) {
    const cycleIdNum = cycleId ? parseInt(cycleId) : undefined;
    return this.mentorEvaluationService.findEvaluationsForMentor(
      mentorId,
      cycleIdNum,
    );
  }

  // retorna as avaliações enviadas pelo usuário logado (tipo um histórico)
  @Get('sent')
  @ApiQuery({
    name: 'cycleId',
    required: false,
    type: Number,
    description: 'Filter by evaluation cycle (optional)',
  })
  async getEvaluationsSent(@Req() req, @Query('cycleId') cycleId?: string) {
    const userId = req.user.id;
    const cycleIdNum = cycleId ? parseInt(cycleId) : undefined;
    return this.mentorEvaluationService.findEvaluationsByUser(
      userId,
      cycleIdNum,
    );
  }

  // retorna as avaliações enviadas pelo usuário logado, para um mentor específico
  @Get('me/:evaluateeId')
  @ApiQuery({
    name: 'cycleId',
    required: false,
    type: Number,
    description: 'Filter by evaluation cycle (optional)',
  })
  async findMyEvaluation(
    @Request() req,
    @Param('evaluateeId') evaluateeId: string,
    @Query('cycleId') cycleId?: string,
  ) {
    const evaluatorId = req.user.userId;
    const cycleIdNum = cycleId ? parseInt(cycleId) : undefined;
    return this.mentorEvaluationService.findByEvaluatorAndEvaluatee(
      evaluatorId,
      parseInt(evaluateeId),
      cycleIdNum,
    );
  }

  // busca ou cria uma avaliação vazia para o mentor
  @Get('find-or-create/:evaluateeId')
  async findOrCreateEmptyEvaluation(
    @Request() req,
    @Param('evaluateeId', ParseIntPipe) evaluateeId: number,
  ) {
    const evaluatorId = req.user.userId;
    const activeCycle = await this.cycleService.findActiveCycle();

    if (!activeCycle) {
      throw new Error('No active evaluation cycle found');
    }

    return this.mentorEvaluationService.findOrCreateEmptyEvaluation(
      evaluatorId,
      evaluateeId,
      activeCycle.id,
    );
  }
}
