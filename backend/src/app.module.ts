import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CiclosModule } from './ciclos/ciclos.module';
import { FinalScoreModule } from './final-score/final-score.module';
import { PrismaService } from './prisma.service';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma.module';
import { AuthModule } from './auth/auth.module';
import { RhModule } from './rh/rh.modules';
import { TrackModule } from './track/track.module';
import { UnitModule } from './unit/unit.module';
import { PositionModule } from './position/position.module';
import { UsersModule } from './users/users.module';
import { MentorEvaluationModule } from './mentor-evaluation/mentor-evaluation.module';
import { EvaluationCycleModule } from './evaluation-cycle/evaluation-cycle.module';
import { MentorModule } from './mentor/mentor.module';
import { SelfEvaluationModule } from './collaborator/self-evaluation/self-evaluation.module';
import { CollaboratorsSearchBarModule } from './collaborator/collaborators-search-bar/collaborators-search-bar.module';
import { ReferenceModule } from './reference/reference.module';
import { PeerEvaluationModule } from './collaborator/peer-evaluation/peer-evaluation.module';
import { AiSummaryModule } from './ai-summary/ai-summary.module';
import { GeminiModule } from './ai/ai.module';
import { ManagerEvaluationModule } from './manager-evaluation/manager-evaluation.module';
import { ManagerModule } from './manager/manager.module';
import { ProjectsModule } from './projects/projects.module';
import { EvaluationCompletionModule } from './evaluation-completion/evaluation-completion.module';
import { AiBrutalFactsModule } from './ai-brutal-facts/ai-brutal-facts.module';
import { PdiModule } from './pdi/pdi.module';
import { OkrModule } from './okr/okr.module';
import { MentorToCollaboratorEvaluationModule } from './mentor-to-collaborator-evaluation/mentor-to-collaborator-evaluation.module';

@Module({
  imports: [
    CiclosModule,
    FinalScoreModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    RhModule,
    TrackModule,
    UnitModule,
    PositionModule,
    UsersModule,
    SelfEvaluationModule,
    MentorEvaluationModule,
    EvaluationCycleModule,
    MentorModule,
    RhModule,
    TrackModule,
    UnitModule,
    PositionModule,
    CollaboratorsSearchBarModule,
    ReferenceModule,
    PeerEvaluationModule,
    AiSummaryModule,
    GeminiModule,
    ManagerEvaluationModule,
    ManagerModule,
    ProjectsModule,
    EvaluationCompletionModule,
    AiBrutalFactsModule,
    PdiModule,
    OkrModule,
    MentorToCollaboratorEvaluationModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
