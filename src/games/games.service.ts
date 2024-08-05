import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Games, GameStatus } from './entities/game.entity';
import { ScheduleGameJobs } from './entities/scheduleGame.entity';

@Injectable()
export class GamesService {
  constructor(
    @InjectRepository(Games) private gameRepository: Repository<Games>,
    @InjectRepository(ScheduleGameJobs)
    private scheduledJobRepository: Repository<ScheduleGameJobs>,
    @InjectQueue('games') private readonly gamesQueue: Queue,
  ) {}

  async create(createGameDto: CreateGameDto) {
    const game = this.gameRepository.create(createGameDto);
    const savedGame = await this.gameRepository.save(game);

    const delay =
      new Date(savedGame.gameDateTime).getTime() - new Date().getTime();

    // Store job entry in the database
    const scheduledJob = new ScheduleGameJobs();
    scheduledJob.gameId = savedGame.id;
    scheduledJob.status = 'Scheduled';
    scheduledJob.scheduledTime = new Date();

    // Add job to the queue
    const job = await this.gamesQueue.add(
      'scheduleGame',
      { gameId: savedGame.id },
      { delay: delay },
    );

    // Update the job ID in the database
    scheduledJob.jobId = job.id.toString();
    await this.scheduledJobRepository.save(scheduledJob);

    return {
      success: true,
      message: 'Game created successfully!',
      data: savedGame,
    };
  }

  async getGamesByUserId(userId: string) {
    try {
      if (!userId) {
        throw new Error('UserId cannot be null or empty.');
      }

      const userGames = await this.gameRepository.find({
        where: [{ creatorId: userId }, { acceptorId: userId }],
      });

      return userGames ?? [];
    } catch (e) {
      return {
        success: false,
        data: null,
        message: e.message,
      };
    }
  }

  async acceptGame(acceptorId: string, joiningCode: string) {
    const game = await this.gameRepository.findOne({
      where: { inviteCode: joiningCode },
    });

    if (!game) {
      return {
        message: 'Game not found',
        success: false,
        data: null,
      };
    }

    // Check if the game has already been accepted or is not in 'Scheduled' status
    if (game.isGameAccepted || game.gameStatus !== GameStatus.Scheduled) {
      return {
        message: 'Game is already accepted or is already completed',
        success: false,
        data: null,
      };
    }

    if (game.creatorId == acceptorId) {
      return {
        message: 'You cannot accept your own game',
        success: false,
        data: null,
      };
    }

    game.acceptorId = acceptorId;
    game.isGameAccepted = true;
    game.gameStatus = GameStatus.Accepted;
    this.gameRepository.save(game);

    return {
      success: true,
      data: game,
      message: 'Game accepted!',
    };
  }

  async findOne(id: string): Promise<Games> {
    return this.gameRepository.findOne({ where: { id } });
  }

  async updateGameStatus(game: Games, status: GameStatus) {
    game.gameStatus = status;
    await this.gameRepository.save(game);
  }

  async findOneByCode(inviteCode: string) {
    const game = await this.gameRepository.findOne({ where: { inviteCode } });
    return game
      ? {
          success: true,
          data: game,
          message: 'Game details fetched successfully!',
        }
      : {
          success: false,
          data: null,
          message: 'Could not find the game with given invite code!',
        };
  }

  findAll(): Promise<Games[]> {
    return this.gameRepository.find();
  }

  findOneById(id: number) {
    return `This action returns a #${id} game`;
  }

  update(id: number, updateGameDto: UpdateGameDto) {
    return `This action updates a #${id} game`;
  }

  remove(id: number) {
    return `This action removes a #${id} game`;
  }
}
