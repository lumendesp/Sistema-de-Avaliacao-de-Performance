import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Get,
  Param,
  Patch,
} from '@nestjs/common';
import { RhService } from './rh.service';
import { CreateClimateSurveyDto } from './dto/create-climate-survey.dto';
import { CloseSurveyDto } from './dto/close-climate-survey.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Climate Survey')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('rh/climate-survey')
export class RhController {
  constructor(private readonly rhService: RhService) {}

  @Post()
  async create(@Req() req, @Body() dto: CreateClimateSurveyDto) {
    const userId = req.user.userId;
    return this.rhService.createSurvey(userId, dto);
  }

  @Get()
  async findAll(@Req() req) {
    const userId = req.user.userId;
    return this.rhService.getSurveySummaries(userId);
  }

  @Get('count')
  countCollaborators() {
    return this.rhService.countCollaborators();
  }

  @Get('averages')
  async getAverages(@Req() req) {
    const userId = req.user.userId;
    return this.rhService.getSurveyAverages(userId);
  }

  @Get(':id')
  async findOne(@Req() req, @Param('id') surveyId: string) {
    const userId = req.user.userId;
    return this.rhService.getSurveyById(userId, parseInt(surveyId));
  }

  @Get(':id/responses')
  async getResponses(@Req() req, @Param('id') surveyId: string) {
    const userId = req.user.userId;
    return this.rhService.getSurveyResponses(userId, parseInt(surveyId));
  }

  @Patch(':id/close')
  async closeSurvey(
    @Req() req,
    @Param('id') surveyId: string,
    @Body() dto: CloseSurveyDto,
  ) {
    const userId = req.user.userId;
    return this.rhService.closeSurvey(userId, parseInt(surveyId), dto);
  }

  @Patch(':id/reopen')
  async reopen(@Param('id') id: string) {
    return this.rhService.reopenSurvey(Number(id));
  }
}
