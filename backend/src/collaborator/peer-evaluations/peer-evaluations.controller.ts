import { Controller, Post, Get, Param, Body } from '@nestjs/common';
import { PeerEvaluationsService } from './peer-evaluations.service';
import { CreatePeerEvaluationDto } from './peer-evaluation.dto';

@Controller('collaborator/peer-evaluations')
export class PeerEvaluationsController {
  constructor(private readonly peerEvaluationsService: PeerEvaluationsService) {}

  @Post()
  async create(@Body() createDto: CreatePeerEvaluationDto) {
    return this.peerEvaluationsService.create(createDto);
  }

  @Get('by-evaluator/:evaluatorId')
  async findAllByEvaluator(@Param('evaluatorId') evaluatorId: string) {
    return this.peerEvaluationsService.findAllByEvaluator(Number(evaluatorId));
  }
}
