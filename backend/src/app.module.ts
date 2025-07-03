import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CiclosModule } from './ciclos/ciclos.module';
import { NotasModule } from './notas/notas.module';
import { PrismaService } from './prisma.service';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma.module';

import { AuthModule } from './auth/auth.module';
import { SelfEvaluationModule } from './collaborator/self-evaluation/self-evaluation.module';
import { UsersModule } from './users/users.module';
import { MentorEvaluationModule } from './mentor-evaluation/mentor-evaluation.module';
import { EvaluationCycleModule } from './evaluation-cycle/evaluation-cycle.module';
import { MentorModule } from './mentor/mentor.module';
import { RhModule } from './rh/rh.modules';
import { TrackModule } from './track/track.module';
import { UnitModule } from './unit/unit.module';
import { PositionModule } from './position/position.module';
import { CollaboratorsSearchBarModule } from './collaborator/collaborators-search-bar/collaborators-search-bar.module';
import { ReferenceModule } from './reference/reference.module';
import { PeerEvaluationModule } from './collaborator/peer-evaluation/peer-evaluation.module';
import { AiSummaryModule } from './ai-summary/ai-summary.module';
import { GeminiModule } from './ai/ai.module';
import { ManagerEvaluationModule } from './manager-evaluation/manager-evaluation.module';
import { ManagerModule } from './manager/manager.module';

@Module({
  imports: [
    CiclosModule,
    NotasModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    SelfEvaluationModule,
    UsersModule,
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
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
