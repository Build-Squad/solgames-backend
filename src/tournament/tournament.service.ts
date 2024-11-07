import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tournament } from './entities/tournament.entity';
import { CreateTournamentDto } from './dto/create-tournament.dto';
import { TournamentParticipant } from './entities/tournament-participant.entity';
import { User } from '../user/entities/user.entity';
import { returnStruct } from 'src/utils/helper';
import {
  TournamentGameStatus,
  TournamentMatch,
} from './entities/tournament-match';

@Injectable()
export class TournamentService {
  constructor(
    @InjectRepository(Tournament)
    private tournamentRepository: Repository<Tournament>,

    @InjectRepository(TournamentParticipant)
    private participantRepository: Repository<TournamentParticipant>,

    @InjectRepository(TournamentMatch)
    private tournamentMatchRepository: Repository<TournamentMatch>,

    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createTournamentDto: CreateTournamentDto) {
    const { adminId, participants, ...tournamentData } = createTournamentDto;

    // Find the admin user
    const admin = await this.userRepository.findOne({ where: { id: adminId } });
    if (!admin) return returnStruct(false, 'User not found', null);

    const tournament = this.tournamentRepository.create({
      ...tournamentData,
      createdBy: admin,
    });

    // Save the tournament first
    const savedTournament = await this.tournamentRepository.save(tournament);

    // Create or find each participant user
    const participantEntities = await Promise.all(
      participants.map(async (participant) => {
        let user = await this.userRepository.findOne({
          where: { publicKey: participant.walletAddress },
        });

        // Create the user if not already present
        if (!user) {
          user = this.userRepository.create({
            publicKey: participant.walletAddress,
            name: participant.alias,
            verifier: 'wallet',
          });
          user = await this.userRepository.save(user);
        }

        // Create the participant entity for this tournament
        return this.participantRepository.create({
          tournament: savedTournament,
          alias: participant.alias,
          walletAddress: participant.walletAddress,
          user: user,
        });
      }),
    );

    await this.participantRepository.save(participantEntities);

    // Shuffle participants for random pairing
    const shuffledParticipants = [...participantEntities].sort(
      () => Math.random() - 0.5,
    );

    // Create matches by pairing participants in sets of two
    const tournamentMatches = [];
    for (let i = 0; i < shuffledParticipants.length; i += 2) {
      if (shuffledParticipants[i + 1]) {
        const match = this.tournamentMatchRepository.create({
          tournament: savedTournament,
          playerOne: shuffledParticipants[i].user,
          playerTwo: shuffledParticipants[i + 1].user,
          tournamentGameStatus: TournamentGameStatus.Scheduled,
        });
        tournamentMatches.push(match);
      }
    }

    // Save tournament matches
    await this.tournamentMatchRepository.save(tournamentMatches);

    return returnStruct(
      true,
      'Tournament Created Successfully',
      savedTournament,
    );
  }

  async getAdminTournaments(userId: string) {
    const tournaments = await this.tournamentRepository.find({
      where: { createdBy: { id: userId } },
      relations: ['participants', 'createdBy'],
    });
    if (!tournaments) {
      return returnStruct(false, 'Tournaments not found', null);
    }

    return returnStruct(
      true,
      'Admin Tournaments fetched successfully',
      tournaments,
    );
  }

  async getPlayerTournaments(userId: string) {
    // Find all matches where the user is either playerOne or playerTwo
    const userTournamentMatches = await this.tournamentMatchRepository.find({
      where: [{ playerOne: { id: userId } }, { playerTwo: { id: userId } }],
      relations: [
        'tournament',
        'tournament.createdBy',
        'tournament.participants',
        'playerOne',
        'playerTwo',
      ],
    });
    if (!userTournamentMatches) {
      return returnStruct(false, 'User tournaments not found', null);
    }

    return returnStruct(
      true,
      'User Tournaments fetched successfully',
      userTournamentMatches,
    );
  }
}
