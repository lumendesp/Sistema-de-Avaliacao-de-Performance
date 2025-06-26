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
} from '@nestjs/common';
import { MentorEvaluationService } from './mentor-evaluation.service';
import { CreateMentorEvaluationDto } from './dto/create-mentor-evaluation.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('mentor-evaluations')
export class MentorEvaluationController {
  constructor(
    private readonly mentorEvaluationService: MentorEvaluationService,
  ) {}

  // criar uma avaliação
  @Post()
  async create(@Body() dto: CreateMentorEvaluationDto, @Request() req) {
    const evaluatorId = req.user.userId; // id do usuário autenticado, que está armazenado no token e disponível em req.user
    return this.mentorEvaluationService.create(evaluatorId, dto);
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
}
