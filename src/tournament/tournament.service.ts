import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tournament } from './entities/tournament.entity';
import { CreateTournamentDto } from './dto/create-tournament.dto';
import { TournamentParticipant } from './entities/tournament-participant.entity';
import { User } from '../user/entities/user.entity';
import { returnStruct } from 'src/utils/helper';

@Injectable()
export class TournamentService {
  constructor(
    @InjectRepository(Tournament)
    private tournamentRepository: Repository<Tournament>,

    @InjectRepository(TournamentParticipant)
    private participantRepository: Repository<TournamentParticipant>,

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

    // Map and save participants
    const participantEntities = participants.map((participant) =>
      this.participantRepository.create({
        tournament: savedTournament,
        alias: participant.alias,
        walletAddress: participant.walletAddress,

        // Here check if a user is alread there with the given wallet.
        // If not, when a new user is created, check the wallet address and add the corresponding user here
        user: null,
      }),
    );

    await this.participantRepository.save(participantEntities);

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
