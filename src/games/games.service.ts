import { Injectable } from '@nestjs/common';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Games } from './entities/game.entity';
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
