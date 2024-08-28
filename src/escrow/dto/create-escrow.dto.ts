import { IsNotEmpty, IsString, IsNumber, Min } from 'class-validator';

export class CreateEscrowDto {
  @IsNotEmpty()
  @IsString()
  inviteCode: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsNotEmpty()
  @IsString()
  publicKey: string;
}
