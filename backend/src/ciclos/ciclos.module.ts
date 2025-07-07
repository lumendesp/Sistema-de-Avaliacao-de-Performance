import { Module } from '@nestjs/common';
import { CiclosService } from './ciclos.service';
import { CiclosController } from './ciclos.controller';
import { GeminiService } from '../ai/ai.service';
import { AiBrutalFactsModule } from '../ai-brutal-facts/ai-brutal-facts.module';

@Module({
  controllers: [CiclosController],
  providers: [CiclosService, GeminiService],
  imports: [AiBrutalFactsModule],
  exports: [AiBrutalFactsModule],
})
export class CiclosModule {}
