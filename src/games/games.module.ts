import { Module } from '@nestjs/common';
import { GamesService } from './games.service';
import { GamesController } from './games.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Games } from './entities/game.entity';
import { BullModule } from '@nestjs/bull';
import { GamesQueue } from './games.queue';
import { ScheduleGameJobs } from './entities/scheduleGame.entity';
import { SocketModule } from 'src/socket/socket.module';
import { Withdrawal } from 'src/escrow/entities/withdrawal.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Games, ScheduleGameJobs, Withdrawal]),
    BullModule.registerQueue({
      name: 'games',
    }),
    SocketModule,
  ],
  providers: [GamesService, GamesQueue],
  controllers: [GamesController],
})
export class GamesModule {}
