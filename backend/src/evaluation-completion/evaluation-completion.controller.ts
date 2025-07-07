import {
  Controller,
  Get,
  ParseIntPipe,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { EvaluationCompletionService } from './evaluation-completion.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('evaluation-completion')
export class EvaluationCompletionController {
  constructor(
    private readonly evaluationCompletionService: EvaluationCompletionService,
  ) {}

  @Get('status')
  async getCompletionStatus(
    @Query('cycleId', ParseIntPipe) cycleId: number,
    @Request() req,
  ) {
    // console.log('req.user:', req.user);
    // console.log('cycleId:', cycleId);

    if (!req.user) {
      throw new Error('Usuário não autenticado');
    }

    const userId = req.user.userId;
    return this.evaluationCompletionService.getCompletionStatus(
      userId,
      cycleId,
    );
  }
}
