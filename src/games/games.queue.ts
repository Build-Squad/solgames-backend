import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { GamesService } from './games.service';
import { Injectable } from '@nestjs/common';
import { GameStatus } from './entities/game.entity';

@Injectable()
@Processor('games')
export class GamesQueue {
  constructor(private readonly gamesService: GamesService) {}

  @Process('scheduleGame')
  async handleScheduleGame(job: Job) {
    const { gameId } = job.data;
    const game = await this.gamesService.findOne(gameId);

    if (!game) {
      return;
    }

    // Check if the game is accepted and not yet started
    if (game.isGameAccepted && game.acceptorId) {
      // Update game status to InProgress
      await this.gamesService.updateGameStatus(game, GameStatus.InProgress);
    } else {
      // Update game status to Expired
      await this.gamesService.updateGameStatus(game, GameStatus.Expired);
    }
  }
}
