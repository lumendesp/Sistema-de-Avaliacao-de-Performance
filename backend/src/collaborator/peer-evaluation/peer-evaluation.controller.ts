import {
  Controller,
  Post,
  Body,
  Request,
  UseGuards,
  Get,
  Param,
  Delete,
  Query,
  Patch,
  ParseIntPipe,
} from '@nestjs/common';
import { PeerEvaluationService } from './peer-evaluation.service';
import { CreatePeerEvaluationDto } from './dto/create-peer-evaluation.dto';
import { UpdatePeerEvaluationDto } from './dto/update-peer-evaluation.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { EvaluationCycleService } from '../../evaluation-cycle/evaluation-cycle.service';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';

@ApiTags('Peer Evaluations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('peer-evaluations')
export class PeerEvaluationController {
  constructor(
    private readonly service: PeerEvaluationService,
    private readonly cycleService: EvaluationCycleService,
  ) {}

  // cria uma nova avaliação por pares
  @Post()
  @ApiOperation({ summary: 'Create a new peer evaluation' })
  @ApiResponse({
    status: 201,
    description: 'Peer evaluation successfully created.',
  })
  create(@Body() dto: CreatePeerEvaluationDto, @Request() req) {
    const evaluatorId = req.user.userId;
    return this.service.create(evaluatorId, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a peer evaluation' })
  @ApiResponse({
    status: 200,
    description: 'Peer evaluation successfully updated.',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePeerEvaluationDto,
    @Request() req,
  ) {
    const evaluatorId = req.user.userId;
    return this.service.update(evaluatorId, id, dto);
  }

  // busca ou cria uma avaliação vazia para o colaborador
  @Get('find-or-create/:evaluateeId')
  @ApiOperation({ summary: 'Find or create empty peer evaluation' })
  async findOrCreateEmptyEvaluation(
    @Request() req,
    @Param('evaluateeId', ParseIntPipe) evaluateeId: number,
  ) {
    const evaluatorId = req.user.userId;
    const activeCycle = await this.cycleService.findActiveCycle();

    if (!activeCycle) {
      throw new Error('No active evaluation cycle found');
    }

    return this.service.findOrCreateEmptyEvaluation(
      evaluatorId,
      evaluateeId,
      activeCycle.id,
    );
  }

  // retorna as avaliações recebidas por um usuário em um ciclo específico
  @Get('cycle/:cycleId/user/:userId')
  @ApiOperation({ summary: 'Get peer evaluations received by user in a cycle' })
  getEvaluationsForUserInCycle(
    @Param('cycleId') cycleId: string,
    @Param('userId') userId: string,
  ) {
    return this.service.findByEvaluateeInCycle(+cycleId, +userId);
  }

  // retorna as avaliações realizadas pelo usuário logado, podendo ser buscada por ciclo
  @Get('me')
  @ApiOperation({ summary: 'Get peer evaluations sent by the logged-in user' })
  getMyEvaluations(@Request() req, @Query('cycleId') cycleId: number) {
    const evaluatorId = req.user.userId;
    return this.service.findByEvaluatorInCycle(evaluatorId, cycleId);
  }

  // retorna a média das notas da avaliação 360 recebidas por um usuário em um ciclo
  @Get('average/cycle/:cycleId/user/:userId')
  @ApiOperation({ summary: 'Get average score received by user in a cycle' })
  getAverageScore(
    @Param('cycleId') cycleId: string,
    @Param('userId') userId: string,
  ) {
    return this.service.getAverageScoreForUserInCycle(+userId, +cycleId);
  }

  // retorna uma avalição de pares específica
  @Get(':id')
  @ApiOperation({ summary: 'Get a peer evaluation by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  // remove uma avaliação de pares
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a peer evaluation by id' })
  remove(@Param('id') id: string, @Request() req: any) {
    const userId = req.user.userId;
    return this.service.remove(+id, userId);
  }
}
