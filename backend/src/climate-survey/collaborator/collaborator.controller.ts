import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  NotFoundException,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CollaboratorService } from './collaborator.service';
import { SubmitClimateSurveyDto } from './dto/submit-climate-survey';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('collaborator')
export class CollaboratorController {
  constructor(private readonly collaboratorService: CollaboratorService) {}

  // Rota pública (sem autenticação)
  @Get('climate-surveys/active')
  async getActiveSurvey() {
    const survey = await this.collaboratorService.findActiveSurvey();
    if (!survey) throw new NotFoundException('No active survey found');
    return survey;
  }

  // Rotas protegidas por JWT
  @UseGuards(JwtAuthGuard)
  @Post('climate-surveys/:id/responses')
  async submitSurveyResponse(
    @Param('id') surveyId: string,
    @Body() dto: SubmitClimateSurveyDto,
    @Req() req,
  ) {
    const userId = req.user.userId;
    return this.collaboratorService.submitSurveyResponse(+surveyId, dto, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('climate-surveys/answered/count')
  async getAnsweredCount(@Req() req) {
    const userId = req.user.userId;
    return this.collaboratorService.countAnsweredByUser(userId);
  }
}
