import { Injectable, NotFoundException } from '@nestjs/common';
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
          tournamentGameStatus: TournamentGameStatus.Awaiting,
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
    return this.tournamentRepository.find({
      where: { createdBy: { id: userId } },
      relations: ['participants', 'createdBy'],
    });
  }

  async findOne(id: string): Promise<Tournament> {
    const tournament = await this.tournamentRepository.findOne({
      where: { id },
      relations: ['participants', 'createdBy', 'winner'],
    });
    if (!tournament) throw new NotFoundException('Tournament not found');
    return tournament;
  }

  async remove(id: string): Promise<void> {
    const tournament = await this.findOne(id);
    await this.tournamentRepository.remove(tournament);
  }
}
