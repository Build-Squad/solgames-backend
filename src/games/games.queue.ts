import { Processor, Process, InjectQueue } from '@nestjs/bull';
import { Job, Queue } from 'bull';
import { GamesService } from './games.service';
import { Injectable } from '@nestjs/common';
import { GameStatus } from './entities/game.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ScheduleGameJobs } from './entities/scheduleGame.entity';
import { SocketService } from 'src/socket/socket.service';

@Injectable()
@Processor('games')
export class GamesQueue {
  constructor(
    @InjectQueue('games') private readonly gameQueue: Queue,
    private readonly gamesService: GamesService,
    private readonly socketService: SocketService,
    @InjectRepository(ScheduleGameJobs)
    private readonly scheduledJobRepository: Repository<ScheduleGameJobs>,
  ) {}

  @Process('scheduleGame')
  async handleScheduleGame(job: Job) {
    const { gameId } = job.data;
    const game = await this.gamesService.findOne(gameId);

    if (!game) {
      return;
    }

    // Find the corresponding ScheduledJob entry
    const scheduledJob = await this.scheduledJobRepository.findOne({
      where: { jobId: job.id.toString() },
    });

    if (!scheduledJob) {
      return;
    }

    // Check if the game is accepted and not yet started
    if (game.isGameAccepted) {
      // Update game status to InProgress
      await this.gamesService.updateGameStatus(game, GameStatus.InProgress);
      scheduledJob.status = GameStatus.InProgress;

      // After 5 minutes check if player's have joined
      await this.gameQueue.add(
        'delayedGameTask',
        { inviteCode: game.inviteCode, gameId },
        { delay: 5 * 60 * 1000 }, // 5 minutes delay
      );
    } else {
      // Update game status to Expired
      await this.gamesService.updateGameStatus(game, GameStatus.Expired);
      scheduledJob.status = GameStatus.Expired;
    }

    // Update completion time
    scheduledJob.completedTime = new Date();
    await this.scheduledJobRepository.save(scheduledJob);
  }

  @Process('delayedGameTask')
  async handleDelayedGameTask(job: Job) {
    const { inviteCode, gameId } = job.data;

    // Access the game from the SocketService's private games field
    const socketGameData = this.socketService.getGame(inviteCode);
    const game = await this.gamesService.findOne(gameId);

    if (!socketGameData) {
      this.gamesService.updateGameStatus(game, GameStatus.Expired);
      return;
    }

    // Implement logic to handle the state of the game after 5 minutes
    if (socketGameData.players.length == 0) {
      this.gamesService.updateGameStatus(game, GameStatus.Expired);
    } else if (socketGameData.players.length == 1) {
      // If any 1 player hasn't joined, completed the game and make the other one winner.
      this.gamesService.updateGameStatus(game, GameStatus.Completed);
      this.gamesService.declareGameWinner(game, socketGameData.players[0].id);
    }
  }
}
