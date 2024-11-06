import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { TournamentService } from './tournament.service';
import { CreateTournamentDto } from './dto/create-tournament.dto';
import { Tournament } from './entities/tournament.entity';

@Controller('tournaments')
export class TournamentController {
  constructor(private readonly tournamentService: TournamentService) {}

  @Post()
  create(@Body() createTournamentDto: CreateTournamentDto) {
    return this.tournamentService.create(createTournamentDto);
  }

  @Get(':userId')
  getAdminTournaments(@Param('userId') userId: string) {
    return this.tournamentService.getAdminTournaments(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Tournament> {
    return this.tournamentService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.tournamentService.remove(id);
  }
}
