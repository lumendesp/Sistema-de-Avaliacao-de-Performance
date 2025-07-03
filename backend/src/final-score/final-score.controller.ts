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
import { FinalScoreService } from './final-score.service';
import { CreateFinalScoreDto } from './dto/create-final-score.dto';
import { UpdateFinalScoreDto } from './dto/update-final-score.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Final Score')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('final-scores')
export class FinalScoreController {
  constructor(private readonly finalScoreService: FinalScoreService) {}

  @Post()
  @ApiOperation({ summary: 'Create a final score evaluation' })
  async create(@Body() dto: CreateFinalScoreDto, @Request() req) {
    try {
      console.log('Received DTO:', dto);
      console.log('User from request:', req.user);
      const adjusterId = req.user.userId;
      return this.finalScoreService.create(adjusterId, dto);
    } catch (error) {
      console.error('Error in controller:', error);
      throw error;
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all final scores' })
  async findAll(@Query('cycleId') cycleId?: number) {
    return this.finalScoreService.findAll(cycleId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a final score by id' })
  async findOne(@Param('id') id: string) {
    return this.finalScoreService.findOne(+id);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get final scores for a specific user' })
  async findByUser(@Param('userId') userId: string, @Query('cycleId') cycleId?: number) {
    return this.finalScoreService.findByUser(+userId, cycleId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a final score' })
  async update(@Param('id') id: string, @Body() dto: UpdateFinalScoreDto, @Request() req) {
    const adjusterId = req.user.userId;
    return this.finalScoreService.update(+id, adjusterId, dto);
  }

  @Get('test/active-cycle')
  @ApiOperation({ summary: 'Test endpoint to check active cycle' })
  async testActiveCycle() {
    return this.finalScoreService.testActiveCycle();
  }
} 