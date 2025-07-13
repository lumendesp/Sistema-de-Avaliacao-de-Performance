import {
  Body,
  Controller,
  Get,
  ParseIntPipe,
  Patch,
  Post,
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

    const completionData =
      await this.evaluationCompletionService.getCompletionStatus(
        userId,
        cycleId,
      );

    const cycleSubmission =
      await this.evaluationCompletionService.getCycleSubmissionInfo(
        userId,
        cycleId,
      );

    return {
      completionStatus: {
        self: completionData.self,
        peer: completionData.peer,
        mentor: completionData.mentor,
        reference: completionData.reference,
      },
      lastSubmittedAt: cycleSubmission?.submittedAt,
      isSubmit: cycleSubmission?.isSubmit,
    };
  }

  @Post('submit')
  async submitEvaluation(
    @Body('cycleId', ParseIntPipe) cycleId: number,
    @Request() req,
  ) {
    if (!req.user) {
      throw new Error('Usuário não autenticado');
    }
    const userId = req.user.userId;
    const submission = await this.evaluationCompletionService.submitEvaluation(
      userId,
      cycleId,
    );
    return { submittedAt: submission.submittedAt };
  }

  @Patch('unlock')
  async unlock(@Request() req, @Body('cycleId') cycleId: number) {
    const userId = req.user.userId;
    return await this.evaluationCompletionService.unlockEvaluation(
      userId,
      cycleId,
    );
  }
}
