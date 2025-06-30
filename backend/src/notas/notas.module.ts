import { Module } from '@nestjs/common';
import { NotasService } from './notas.service';
import { NotasController } from './notas.controller';

@Module({
  controllers: [NotasController],
  providers: [NotasService],
})
export class NotasModule {}
