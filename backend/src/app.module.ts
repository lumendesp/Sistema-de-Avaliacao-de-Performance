import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { ConfigModule } from '@nestjs/config';

import { AuthModule } from './auth/auth.module';
import { SelfEvaluationModule } from './collaborator/self-evaluation/self-evaluation.module';
import { UsersModule } from './users/users.module';
import { MentorEvaluationModule } from './mentor-evaluation/mentor-evaluation.module';
import { EvaluationCycleModule } from './evaluation-cycle/evaluation-cycle.module';
import { MentorModule } from './mentor/mentor.module';
import { CollaboratorsSearchBarModule } from './collaborator/collaborators-search-bar/collaborators-search-bar.module';
import { RHDashboardModule } from './rh/dashboard/dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    SelfEvaluationModule,
    UsersModule,
    MentorEvaluationModule,
    EvaluationCycleModule,
    MentorModule,
    CollaboratorsSearchBarModule,
    RHDashboardModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
