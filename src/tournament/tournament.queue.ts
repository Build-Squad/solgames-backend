import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Tournament, TournamentStatus } from './entities/tournament.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ScheduleGameJobs } from 'src/games/entities/scheduleGame.entity';

@Injectable()
@Processor('tournaments')
export class TournamentQueue {
  constructor(
    @InjectRepository(Tournament)
    private readonly tournamentRepository: Repository<Tournament>,
    @InjectRepository(ScheduleGameJobs)
    private readonly scheduledJobRepository: Repository<ScheduleGameJobs>,
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
      scheduledJob.status = TournamentStatus.Ongoing;
    } else {
      console.error(`Tournament with ID ${tournamentId} not found.`);
      scheduledJob.status = 'Failed';
    }

    // Update completion time
    scheduledJob.completedTime = new Date();
    await this.scheduledJobRepository.save(scheduledJob);
  }
}
