import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsDateString,
} from 'class-validator';

export class CreateGameDto {
  @IsOptional()
  @IsString()
  creatorId?: string;

  @IsOptional()
  @IsString()
  acceptorId?: string;

  @IsString()
  token: string;

  @IsNumber({ maxDecimalPlaces: 8 })
  betAmount: number;

  @IsString()
  inviteCode: string;

  @IsDateString()
  gameDateTime: Date;

  @IsOptional()
  @IsBoolean()
  isGameAccepted?: boolean;
}
