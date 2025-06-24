import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CiclosModule } from './ciclos/ciclos.module';
import { NotasModule } from './notas/notas.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [CiclosModule, NotasModule, UserModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
