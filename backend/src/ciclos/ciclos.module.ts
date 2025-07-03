import { Module } from '@nestjs/common';
import { CiclosService } from './ciclos.service';
import { CiclosController } from './ciclos.controller';

@Module({
  controllers: [CiclosController],
  providers: [CiclosService],
})
export class CiclosModule {}
