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
      message: 'User created successfully!',
      data: savedGame,
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
