import { Controller, Post, Patch, Get, Param, Body, Req, ParseIntPipe, UseGuards, Request } from '@nestjs/common';
import { ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { ManagerEvaluationService } from './manager-evaluation.service';
import { CreateManagerEvaluationDto } from './dto/create-manager-evaluation.dto';
import { UpdateManagerEvaluationDto } from './dto/update-manager-evaluation.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('manager-evaluation')
export class ManagerEvaluationController {
  constructor(private readonly service: ManagerEvaluationService) {}

  @Post()
  @ApiBody({
    description: 'Exemplo de criação de avaliação de gestor',
    schema: {
      example: {
        evaluateeId: 1,
        cycleId: 1,
        items: [
          {
            criterionId: 1,
            score: 4,
            justification: 'Demonstra postura profissional exemplar.'
          },
          {
            criterionId: 2,
            score: 3,
            justification: 'Atende às expectativas de ética.'
          }
        ]
      }
    }
  })
  async create(@Body() dto: CreateManagerEvaluationDto, @Request() req) {
    const evaluatorId = req.user.userId;
    return this.service.create(evaluatorId, dto);
  }

  @Patch('by-evaluatee/:evaluateeId')
  @ApiBody({
    description: 'Exemplo de atualização de avaliação de gestor',
    schema: {
      example: {
        items: [
          {
            criterionId: 1,
            score: 5,
            justification: 'Melhorou ainda mais a postura.'
          },
          {
            criterionId: 2,
            score: 4,
            justification: 'Superou as expectativas em ética.'
          }
        ]
      }
    }
  })
  async updateByEvaluatee(
    @Param('evaluateeId', ParseIntPipe) evaluateeId: number,
    @Body() dto: UpdateManagerEvaluationDto,
    @Request() req
  ) {
    const evaluatorId = req.user.userId;
    // Busca a avaliação do gestor logado para o colaborador
    const evaluation = await this.service.findByEvaluatorAndEvaluatee(evaluatorId, evaluateeId);
    if (!evaluation) throw new Error('Avaliação não encontrada');
    return this.service.update(evaluation.id, dto);
  }

  @Get('by-evaluatee/:evaluateeId')
  async findByEvaluatorAndEvaluatee(
    @Param('evaluateeId', ParseIntPipe) evaluateeId: number,
    @Request() req
  ) {
    const evaluatorId = req.user.userId;
    return this.service.findByEvaluatorAndEvaluatee(evaluatorId, evaluateeId);
  }

  @Get('by-manager/:evaluatorId')
  async findByManager(@Param('evaluatorId', ParseIntPipe) evaluatorId: number) {
    return this.service.findByManager(evaluatorId);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }
}
