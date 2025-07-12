import { Module } from '@nestjs/common';
import { RhService } from './rh.service';
import { RhController } from './rh.controller';

@Module({
  controllers: [RhController],
  providers: [RhService],
})
export class RhModule {}
