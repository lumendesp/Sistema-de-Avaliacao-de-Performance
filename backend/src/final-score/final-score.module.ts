import { Module } from '@nestjs/common';
import { FinalScoreService } from './final-score.service';
import { FinalScoreController } from './final-score.controller';

@Module({
  controllers: [FinalScoreController],
  providers: [FinalScoreService],
})
export class FinalScoreModule {}
