import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { GamesService } from './games.service';
import { Injectable } from '@nestjs/common';
import { GameStatus } from './entities/game.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ScheduleGameJobs } from './entities/scheduleGame.entity';

@Injectable()
@Processor('games')
export class GamesQueue {
  constructor(
    private readonly gamesService: GamesService,
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
    if (game.isGameAccepted && game.acceptorId) {
      // Update game status to InProgress
      await this.gamesService.updateGameStatus(game, GameStatus.InProgress);
      scheduledJob.status = GameStatus.InProgress;
    } else {
      // Update game status to Expired
      await this.gamesService.updateGameStatus(game, GameStatus.Expired);
      scheduledJob.status = GameStatus.Expired;
    }

    // Update completion time
    scheduledJob.completedTime = new Date();
    await this.scheduledJobRepository.save(scheduledJob);
  }
}
