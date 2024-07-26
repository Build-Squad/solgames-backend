import { Injectable } from '@nestjs/common';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Games, GameStatus } from './entities/game.entity';
import { Repository } from 'typeorm';

@Injectable()
export class GamesService {
  constructor(
    @InjectRepository(Games) private gameRepository: Repository<Games>,
  ) {}

  async create(createGameDto: CreateGameDto) {
    const game = this.gameRepository.create(createGameDto);
    const savedGame = await this.gameRepository.save(game);

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
        where: { creatorId: userId },
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

    // Check if the game has already been accepted or is not in 'Scheduled' status
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

  findOne(id: number) {
    return `This action returns a #${id} game`;
  }

  update(id: number, updateGameDto: UpdateGameDto) {
    return `This action updates a #${id} game`;
  }

  remove(id: number) {
    return `This action removes a #${id} game`;
  }
}
