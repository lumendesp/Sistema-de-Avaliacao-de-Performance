import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { ManagerEvaluationService } from './manager-evaluation.service';
import { CreateManagerEvaluationDto } from './dto/create-manager-evaluation.dto';
import { UpdateManagerEvaluationDto } from './dto/update-manager-evaluation.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Manager Evaluation')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('manager-evaluations')
export class ManagerEvaluationController {
  constructor(private readonly managerEvaluationService: ManagerEvaluationService) {}

  @Post()
  @ApiOperation({ summary: 'Create a manager evaluation' })
  async create(@Body() dto: CreateManagerEvaluationDto, @Request() req) {
    const evaluatorId = req.user.userId;
    return this.managerEvaluationService.create(evaluatorId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all manager evaluations' })
  async findAll(@Query('cycleId') cycleId?: number) {
    return this.managerEvaluationService.findAll(cycleId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a manager evaluation by id' })
  async findOne(@Param('id') id: string) {
    return this.managerEvaluationService.findOne(+id);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get manager evaluations for a specific user' })
  async findByUser(@Param('userId') userId: string, @Query('cycleId') cycleId?: number) {
    return this.managerEvaluationService.findByUser(+userId, cycleId);
  }

  @Get('evaluator/me')
  @ApiOperation({ summary: 'Get manager evaluations sent by the logged-in user' })
  async findMyEvaluations(@Request() req, @Query('cycleId') cycleId?: number) {
    const evaluatorId = req.user.userId;
    return this.managerEvaluationService.findByEvaluator(evaluatorId, cycleId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a manager evaluation' })
  async update(@Param('id') id: string, @Body() dto: UpdateManagerEvaluationDto, @Request() req) {
    const evaluatorId = req.user.userId;
    return this.managerEvaluationService.update(+id, evaluatorId, dto);
  }
} 