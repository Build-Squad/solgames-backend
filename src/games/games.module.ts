import { Module } from '@nestjs/common';
import { GamesService } from './games.service';
import { GamesController } from './games.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Games } from './entities/game.entity';
import { BullModule } from '@nestjs/bull';
import { GamesQueue } from './games.queue';

@Module({
  imports: [
    TypeOrmModule.forFeature([Games]),
    BullModule.registerQueue({
      name: 'games',
    }),
  ],
  providers: [GamesService, GamesQueue],
  controllers: [GamesController],
})
export class GamesModule {}
