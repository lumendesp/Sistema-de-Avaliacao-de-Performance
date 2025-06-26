import { Module } from '@nestjs/common';
import { MentorController } from './mentor.controller';
import { MentorService } from './mentor.service';
import { PrismaModule } from 'src/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [MentorController],
  providers: [MentorService]
})
export class MentorModule {}
