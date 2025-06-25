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
} from '@nestjs/common';
import { SelfEvaluationService } from './self-evaluation.service';
import { CreateSelfEvaluationDto } from './dto/create-self-evaluation.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
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
  async findByUser(@Req() req) {
    const userId = req.user.userId;
    return this.selfEvaluationService.findByUser(userId);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSelfEvaluationDto,
  ) {
    return this.selfEvaluationService.update(id, dto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.selfEvaluationService.delete(+id);
  }

  @Get('available')
  @ApiOperation({ summary: 'Listar critérios de autoavaliação disponíveis' })
  async getAvailableCriteria(@Req() req) {
    const userId = req.user.userId;
    return this.selfEvaluationService.getAvailableCriteria(userId);
  }
}
