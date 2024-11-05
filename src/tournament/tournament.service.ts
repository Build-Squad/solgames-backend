import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tournament } from './entities/tournament.entity';
import {
  CreateTournamentDto,
  UpdateTournamentDto,
} from './dto/create-tournament.dto';
import { TournamentParticipant } from './entities/tournament-participant.entity';
import { User } from '../user/entities/user.entity';

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

  async create(createTournamentDto: CreateTournamentDto): Promise<Tournament> {
    const { adminId, participants, ...tournamentData } = createTournamentDto;

    // Find the admin user
    const admin = await this.userRepository.findOne({ where: { id: adminId } });
    if (!admin) throw new NotFoundException('Admin user not found');

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
        user: null, // we need to check her if the person who's wallet is referred is already a user or not.
      }),
    );

    await this.participantRepository.save(participantEntities);

    return savedTournament;
  }

  async findAll(): Promise<Tournament[]> {
    return this.tournamentRepository.find({
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
