import { Module } from '@nestjs/common';
import { MentorToCollaboratorEvaluationController } from './mentor-to-collaborator-evaluation.controller';
import { MentorToCollaboratorEvaluationService } from './mentor-to-collaborator-evaluation.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [MentorToCollaboratorEvaluationController],
  providers: [MentorToCollaboratorEvaluationService, PrismaService],
})
export class MentorToCollaboratorEvaluationModule {}
