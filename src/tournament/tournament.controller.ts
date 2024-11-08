import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { TournamentService } from './tournament.service';
import { CreateTournamentDto } from './dto/create-tournament.dto';

@Controller('tournaments')
export class TournamentController {
  constructor(private readonly tournamentService: TournamentService) {}

  @Post()
  create(@Body() createTournamentDto: CreateTournamentDto) {
    return this.tournamentService.create(createTournamentDto);
  }

  @Get('admin/:userId')
  getAdminTournaments(@Param('userId') userId: string) {
    return this.tournamentService.getAdminTournaments(userId);
  }

  @Get('player/:userId')
  async getPlayerTournaments(@Param('userId') userId: string) {
    return await this.tournamentService.getPlayerTournaments(userId);
  }

  @Get('tournament/:tournamentId')
  async getTournamentDetails(@Param('userId') userId: string) {
    return await this.tournamentService.getTournamentDetails(userId);
  }
}
