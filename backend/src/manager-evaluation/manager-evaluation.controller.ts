import { Controller, Post, Patch, Get, Param, Body, Req, ParseIntPipe } from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';
import { ManagerEvaluationService } from './manager-evaluation.service';
import { CreateManagerEvaluationDto } from './dto/create-manager-evaluation.dto';
import { UpdateManagerEvaluationDto } from './dto/update-manager-evaluation.dto';

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
            justification: 'Demonstra postura profissional exemplar.',
          },
          {
            criterionId: 2,
            score: 3,
            justification: 'Atende às expectativas de ética.',
          },
        ],
      },
    },
  })
  async create(@Req() req, @Body() dto: CreateManagerEvaluationDto) {
    // req.user.userId se usar auth, aqui só exemplo:
    const evaluatorId = req.body.evaluatorId || 1;
    return this.service.create(evaluatorId, dto);
  }

  @Patch(':id')
  @ApiBody({
    description: 'Exemplo de atualização de avaliação de gestor',
    schema: {
      example: {
        items: [
          {
            criterionId: 1,
            score: 5,
            justification: 'Melhorou ainda mais a postura.',
          },
          {
            criterionId: 2,
            score: 4,
            justification: 'Superou as expectativas em ética.',
          },
        ],
      },
    },
  })
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateManagerEvaluationDto) {
    return this.service.update(id, dto);
  }

  @Get('by-manager/:evaluatorId')
  async findByManager(@Param('evaluatorId', ParseIntPipe) evaluatorId: number) {
    return this.service.findByManager(evaluatorId);
  }

  @Get('by-evaluatee/:evaluateeId')
  async findByEvaluatee(@Param('evaluateeId', ParseIntPipe) evaluateeId: number) {
    return this.service.findByEvaluatee(evaluateeId);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }
}
