import { Module } from '@nestjs/common';
import { GeminiService } from './ai.service';
import { GeminiController } from './ai.controller';

@Module({
  controllers: [GeminiController],
  providers: [GeminiService],
})
export class GeminiModule {}