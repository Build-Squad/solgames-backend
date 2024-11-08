import { Module } from '@nestjs/common';
import { TournamentService } from './tournament.service';
import { TournamentController } from './tournament.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tournament } from './entities/tournament.entity';
import { TournamentParticipant } from './entities/tournament-participant.entity';
import { User } from 'src/user/entities/user.entity';
import { TournamentMatch } from './entities/tournament-match';
import { BullModule } from '@nestjs/bull';
import { ScheduleGameJobs } from 'src/games/entities/scheduleGame.entity';
import { TournamentQueue } from './tournament.queue';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Tournament,
      TournamentParticipant,
      TournamentMatch,
      User,
      ScheduleGameJobs,
    ]),
    BullModule.registerQueue({ name: 'tournaments' }),
  ],
  controllers: [TournamentController],
  providers: [TournamentService, TournamentQueue],
})
export class TournamentModule {}
