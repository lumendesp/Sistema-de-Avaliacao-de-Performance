import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { ConfigModule } from '@nestjs/config';

// import { CollaboratorModule } from './collaborator/collaborator.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MentorEvaluationModule } from './mentor-evaluation/mentor-evaluation.module';
import { EvaluationCycleModule } from './evaluation-cycle/evaluation-cycle.module';
import { MentorModule } from './mentor/mentor.module';
import { SelfEvaluationModule } from './collaborator/self-evaluation/self-evaluation.module';
import { ManagerEvaluationModule } from './manager/evaluation/manager-evaluation.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    SelfEvaluationModule,
    ManagerEvaluationModule,
    UsersModule,
    MentorEvaluationModule,
    EvaluationCycleModule,
    MentorModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
