import {
  IsNotEmpty,
  IsString,
  IsNumber,
  Min,
  IsOptional,
} from 'class-validator';

export class CreateEscrowDto {
  @IsString()
  @IsOptional()
  inviteCode: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsNotEmpty()
  @IsString()
  publicKey: string;
}
