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
} from '@nestjs/common';
import { PeerEvaluationService } from './peer-evaluation.service';
import { CreatePeerEvaluationDto } from './dto/create-peer-evaluation.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
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
  constructor(private readonly service: PeerEvaluationService) {}

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

  // retorna uma avalição de pares específica
  @Get(':id')
  @ApiOperation({ summary: 'Get a peer evaluation by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  // remove uma avaliação de pares
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a peer evaluation by id' })
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
