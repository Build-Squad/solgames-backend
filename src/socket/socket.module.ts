import { Global, Module } from '@nestjs/common';
import { SocketService } from './socket.service';
import { SocketGateway } from './socket.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Games } from 'src/games/entities/game.entity';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Games])],
  providers: [SocketService, SocketGateway],
  exports: [SocketService],
})
export class SocketModule {}
