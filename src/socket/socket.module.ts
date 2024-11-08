import { Global, Module } from '@nestjs/common';
import { SocketService } from './socket.service';
import { SocketGateway } from './socket.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Games } from 'src/games/entities/game.entity';
import { TournamentMatch } from 'src/tournament/entities/tournament-match';
import { User } from 'src/user/entities/user.entity';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Games, TournamentMatch, User])],
  providers: [SocketService, SocketGateway],
  exports: [SocketService],
})
export class SocketModule {}
