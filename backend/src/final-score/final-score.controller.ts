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
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Final Score')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('final-scores')
export class FinalScoreController {
  constructor(private readonly finalScoreService: FinalScoreService) {}

  @Post()
  @ApiOperation({ summary: 'Create a final score evaluation' })
  @ApiResponse({ status: 201, description: 'Final score created successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid input.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
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
  @ApiResponse({ status: 200, description: 'List of all final scores.' })
  async findAll(@Query('cycleId') cycleId?: number) {
    return this.finalScoreService.findAll(cycleId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a final score by id' })
  @ApiResponse({ status: 200, description: 'Final score found.' })
  @ApiResponse({ status: 404, description: 'Final score not found.' })
  async findOne(@Param('id') id: string) {
    return this.finalScoreService.findOne(+id);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get final scores for a specific user' })
  @ApiResponse({ status: 200, description: 'Final scores for the user.' })
  async findByUser(@Param('userId') userId: string, @Query('cycleId') cycleId?: number) {
    return this.finalScoreService.findByUser(+userId, cycleId);
  }

  @Get('user/:userId/cycle/:cycleId')
  @ApiOperation({ summary: 'Get the final score grade for a user in a specific cycle' })
  @ApiResponse({ status: 200, description: 'Final score grade for the user and cycle.' })
  @ApiResponse({ status: 404, description: 'Final score not found for the user and cycle.' })
  async getFinalScoreGradeByUserAndCycle(@Param('userId') userId: string, @Param('cycleId') cycleId: string) {
    const score = await this.finalScoreService.getFinalScoreGradeByUserAndCycle(+userId, +cycleId);
    if (!score) {
      return { message: 'Final score not found for this user and cycle.' };
    }
    return score;
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a final score' })
  @ApiResponse({ status: 200, description: 'Final score updated.' })
  @ApiResponse({ status: 404, description: 'Final score not found.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async update(@Param('id') id: string, @Body() dto: UpdateFinalScoreDto, @Request() req) {
    const adjusterId = req.user.userId;
    return this.finalScoreService.update(+id, adjusterId, dto);
  }

  @Get('test/active-cycle')
  @ApiOperation({ summary: 'Test endpoint to check active cycle' })
  @ApiResponse({ status: 200, description: 'Active cycle info.' })
  async testActiveCycle() {
    return this.finalScoreService.testActiveCycle();
  }
} 