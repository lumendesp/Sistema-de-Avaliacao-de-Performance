import { Module } from '@nestjs/common';
import { PeerEvaluationsModule } from './peer-evaluations/peer-evaluations.module';

@Module({
  imports: [PeerEvaluationsModule],
  controllers: [],
  providers: [],
  exports: [],
})
export class CollaboratorModule {}
