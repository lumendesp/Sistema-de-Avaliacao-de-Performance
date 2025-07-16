import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import { MentorToCollaboratorEvaluationService } from './mentor-to-collaborator-evaluation.service';
import { CreateMentorToCollaboratorEvaluationDto } from './dto/create-mentor-to-collaborator-evaluation.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('mentor-to-collaborator-evaluations')
export class MentorToCollaboratorEvaluationController {
  constructor(
    private readonly service: MentorToCollaboratorEvaluationService,
  ) {}

  @Post()
  async create(
    @Body() dto: CreateMentorToCollaboratorEvaluationDto,
    @Request() req: any,
  ) {
    // req.user.roles pode ser um array de objetos { role: string } ou array de strings
    let roles: string[] = [];
    if (Array.isArray(req.user.roles)) {
      if (typeof req.user.roles[0] === 'string') {
        roles = req.user.roles;
      } else if (
        typeof req.user.roles[0] === 'object' &&
        req.user.roles[0]?.role
      ) {
        roles = req.user.roles.map((r: any) => r.role);
      }
    }
    const evaluatorId = req.user.userId;
    return this.service.create(evaluatorId, roles, dto);
  }

  @Get('mentor/:mentorId')
  async getByMentor(@Param('mentorId', ParseIntPipe) mentorId: number) {
    return this.service.getByMentor(mentorId);
  }

  @Get('collaborator/:collaboratorId')
  async getByCollaborator(
    @Param('collaboratorId', ParseIntPipe) collaboratorId: number,
  ) {
    return this.service.getByCollaborator(collaboratorId);
  }
}
