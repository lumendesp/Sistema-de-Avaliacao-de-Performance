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
  Delete,
  Query,
} from '@nestjs/common';
import { SelfEvaluationService } from './self-evaluation.service';
import { CreateSelfEvaluationDto } from './dto/create-self-evaluation.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam, ApiQuery} from '@nestjs/swagger';
import { UpdateSelfEvaluationDto } from './dto/update-self-evaluation.dto';

@ApiTags('Self Evaluation')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('self-evaluation')
export class SelfEvaluationController {
  constructor(private readonly selfEvaluationService: SelfEvaluationService) {}

  @Post()
  async create(@Req() req, @Body() dto: CreateSelfEvaluationDto) {
    const userId = req.user.userId;
    return this.selfEvaluationService.create(userId, dto);
  }

  @Get()
  async findByUser(@Req() req, @Query('cycleId') cycleId?: number) {
    const userId = req.user.userId;

    const where: any = { userId };
    if (cycleId) where.cycleId = cycleId;

    return this.selfEvaluationService.findByUser(where);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSelfEvaluationDto,
  ) {
    return this.selfEvaluationService.update(id, dto);
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.selfEvaluationService.delete(id);
  }


  @Get('available')
  @ApiOperation({ summary: 'Listar critérios de autoavaliação disponíveis' })
  async getAvailableCriteria(@Req() req) {
    const userId = req.user.userId;
    return this.selfEvaluationService.getAvailableCriteria(userId);
  }

  @Get('grouped/:cycleId')
  @ApiOperation({ summary: 'Critérios e respostas agrupados por grupo de critérios de um ciclo anterior' })
  @UseGuards(JwtAuthGuard)
  async getGroupedByCycle(
    @Param('cycleId', ParseIntPipe) cycleId: number,
    @Req() req: any
  ) {
    const userId = req.user.userId; // conforme seu token
    return this.selfEvaluationService.getGroupedEvaluation(cycleId, userId);
  }


  @Get('user/:userId')
  @ApiOperation({ summary: 'Listar todas as autoavaliações anteriores de um usuário' })
  @ApiParam({ name: 'userId', type: Number })
  getByUserId(@Param('userId', ParseIntPipe) userId: number) {
    return this.selfEvaluationService.getByUserId(userId);
  }

  @Get('avg-score')
  @ApiOperation({
    summary: 'Retorna apenas a média da autoavaliação e dados básicos do ciclo',
  })
  @ApiQuery({ name: 'cycleId', required: true })
  async getAverageScore(@Req() req, @Query('cycleId', ParseIntPipe) cycleId: number) {
    const userId = req.user.userId;
    return this.selfEvaluationService.getSummary(userId, cycleId);
  }

}
