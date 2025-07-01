import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
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
import { CollaboratorsSearchBarModule } from './collaborator/collaborators-search-bar/collaborators-search-bar.module';
import { ReferenceModule } from './reference/reference.module';
import { PeerEvaluationModule } from './collaborator/peer-evaluation/peer-evaluation.module';
import { FinalScoreModule } from './final-score/final-score.module';
import { ManagerEvaluationModule } from './manager-evaluation/manager-evaluation.module';

@Module({
  imports: [
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
    MentorEvaluationModule,
    EvaluationCycleModule,
    MentorModule,
    CollaboratorsSearchBarModule,
    ReferenceModule,
    PeerEvaluationModule,
    FinalScoreModule,
    ManagerEvaluationModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
