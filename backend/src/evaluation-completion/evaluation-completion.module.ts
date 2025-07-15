import { Module } from '@nestjs/common';
import { EvaluationCompletionService } from './evaluation-completion.service';
import { EvaluationCompletionController } from './evaluation-completion.controller';
import { PrismaModule } from 'src/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [EvaluationCompletionController],
  providers: [EvaluationCompletionService],
})
export class EvaluationCompletionModule {}
