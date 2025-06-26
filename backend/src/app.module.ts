import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { ConfigModule } from '@nestjs/config';

import { AuthModule } from './auth/auth.module';
import { SelfEvaluationModule } from './collaborator/self-evaluation/self-evaluation.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    SelfEvaluationModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}