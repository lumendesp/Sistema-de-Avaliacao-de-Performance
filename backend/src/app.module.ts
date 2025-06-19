import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { UserModule } from './user/user.module';
import { EvaluationModule } from './evaluation/evaluation.module';
import { RoleModule } from './role/role.module';

@Module({
  imports: [UserModule, EvaluationModule, RoleModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
