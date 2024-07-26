import { Module } from '@nestjs/common';
import { GamesService } from './games.service';
import { GamesController } from './games.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Games } from './entities/game.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Games])],
  controllers: [GamesController],
  providers: [GamesService],
})
export class GamesModule {}
