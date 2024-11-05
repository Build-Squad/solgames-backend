import { Module } from '@nestjs/common';
import { TournamentService } from './tournament.service';
import { TournamentController } from './tournament.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tournament } from './entities/tournament.entity';
import { TournamentParticipant } from './entities/tournament-participant.entity';
import { User } from 'src/user/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Tournament, TournamentParticipant, User]),
  ],
  controllers: [TournamentController],
  providers: [TournamentService],
})
export class TournamentModule {}
