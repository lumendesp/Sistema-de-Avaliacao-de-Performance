import { Module } from '@nestjs/common';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { PrismaService } from '../prisma.service';
import { JwtStrategy } from '../auth/jwt.strategy';

@Module({
  controllers: [ProfileController],
  providers: [ProfileService, PrismaService, JwtStrategy],
})
export class ProfileModule {}
