import {
  IsNotEmpty,
  IsString,
  IsNumber,
  Min,
  IsOptional,
} from 'class-validator';

export class CreateEscrowDto {
  @IsNotEmpty()
  @IsString()
  publicKey: string;

  @IsNotEmpty()
  @IsString()
  inviteCode: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  amount: number;
}
