import { Module } from '@nestjs/common';
import { SocketService } from './socket.service';
import { SocketGateway } from './socket.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Games } from 'src/games/entities/game.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Games])],
  providers: [SocketService, SocketGateway],
})
export class SocketModule {}
