import {
  IsEnum,
  IsInt,
  IsString,
  IsArray,
  IsUUID,
  IsOptional,
  IsISO8601,
  IsNumber,
} from 'class-validator';
import {
  TournamentStatus,
  TournamentType,
} from '../entities/tournament.entity';

export class ParticipantDto {
  @IsString()
  alias: string;

  @IsString()
  walletAddress: string;
}
export class CreateTournamentDto {
  @IsUUID()
  adminId: string;

  @IsString()
  tournamentName: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(TournamentType)
  tournamentType: TournamentType;

  @IsInt()
  numberOfParticipants: number;

  @IsArray()
  participants: {
    alias: string;
    walletAddress: string;
  }[];

  @IsNumber({ maxDecimalPlaces: 8 })
  rewardAmount: number;

  @IsISO8601()
  tournamentDateTime: string;

  @IsEnum(TournamentStatus)
  @IsOptional()
  status?: TournamentStatus = TournamentStatus.Scheduled;
}

export class UpdateTournamentDto {
  @IsString()
  @IsOptional()
  tournamentName?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(TournamentType)
  @IsOptional()
  tournamentType?: TournamentType;

  @IsInt()
  @IsOptional()
  numberOfParticipants?: number;

  @IsArray()
  @IsOptional()
  participants?: {
    alias: string;
    walletAddress: string;
  }[];

  @IsNumber({ maxDecimalPlaces: 8 })
  @IsOptional()
  rewardAmount?: number;

  @IsISO8601()
  @IsOptional()
  tournamentDateTime?: string;

  @IsEnum(TournamentStatus)
  @IsOptional()
  status?: TournamentStatus;
}
