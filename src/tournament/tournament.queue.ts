import { Processor, Process, InjectQueue } from '@nestjs/bull';
import { Job, Queue } from 'bull';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Tournament, TournamentStatus } from './entities/tournament.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ScheduleGameJobs } from 'src/games/entities/scheduleGame.entity';
import {
  TournamentGameStatus,
  TournamentMatch,
} from './entities/tournament-match';
import { SocketService } from 'src/socket/socket.service';
import { User } from 'src/user/entities/user.entity';

@Injectable()
@Processor('tournaments')
export class TournamentQueue {
  constructor(
    @InjectQueue('tournaments') private readonly gameQueue: Queue,
    private readonly socketService: SocketService,
    @InjectRepository(Tournament)
    private readonly tournamentRepository: Repository<Tournament>,
    @InjectRepository(ScheduleGameJobs)
    private readonly scheduledJobRepository: Repository<ScheduleGameJobs>,
    @InjectRepository(TournamentMatch)
    private readonly tournamentMatchRepository: Repository<TournamentMatch>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  @Process('startTournament')
  async handleStartTournament(job: Job) {
    const { tournamentId } = job.data;

    // Find the corresponding ScheduledJob entry
    const scheduledJob = await this.scheduledJobRepository.findOne({
      where: { jobId: job.id.toString() },
    });

    if (!scheduledJob) {
      return;
    }

    // Find the tournament
    const tournament = await this.tournamentRepository.findOne({
      where: { id: tournamentId },
    });

    // TODO: Tournament game status to inprogress

    if (tournament) {
      // Update tournament status to 'ongoing'
      tournament.status = TournamentStatus.Ongoing;
      await this.tournamentRepository.save(tournament);

      // Find and update all matches associated with the tournament to 'InProgress'
      const matches = await this.tournamentMatchRepository.find({
        where: { tournament: { id: tournamentId } },
      });

      for (const match of matches) {
        match.tournamentGameStatus = TournamentGameStatus.InProgress;
        await this.tournamentMatchRepository.save(match);
      }

      // After 5 minutes check if player's have joined
      await this.gameQueue.add(
        'delayedGameTask',
        { tournamentId: tournamentId, gameId: tournamentId },
        { delay: 5 * 60 * 1000 }, // 5 minutes delay
      );

      // Update the scheduled job status to 'ongoing'
      scheduledJob.status = TournamentStatus.Ongoing;
    } else {
      console.error(`Tournament with ID ${tournamentId} not found.`);
      scheduledJob.status = 'Failed';
    }

    // Update completion time
    scheduledJob.completedTime = new Date();
    await this.scheduledJobRepository.save(scheduledJob);
  }

  // This will check if both the player's have joined the game in 5 minutes or not
  @Process('delayedTournamentGameTask')
  async handleDelayedGameTask(job: Job) {
    const { tournamentId, gameId } = job.data;

    // Access the game from the SocketService's private games field
    const socketGameData = this.socketService.getGame(gameId);
    const tournamentMatch = await this.tournamentMatchRepository.findOne({
      where: { id: tournamentId },
    });

    if (!socketGameData) {
      tournamentMatch.tournamentGameStatus = TournamentGameStatus.Expired;
      await this.tournamentMatchRepository.save(tournamentMatch);
      return;
    }

    if (socketGameData.players.length == 0) {
      tournamentMatch.tournamentGameStatus = TournamentGameStatus.Expired;
    } else if (socketGameData.players.length == 1) {
      const winnerUser = await this.userRepository.findOne({
        where: { id: socketGameData.players[0].id },
      });

      // If any 1 player hasn't joined, completed the game and make the other one winner.
      tournamentMatch.tournamentGameStatus = TournamentGameStatus.Completed;
      tournamentMatch.winner = winnerUser;
    }
    await this.tournamentMatchRepository.save(tournamentMatch);
  }
}
