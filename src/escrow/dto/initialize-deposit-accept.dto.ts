import { IsNotEmpty, IsString } from 'class-validator';

export class InitializeAcceptDepositDto {
  @IsNotEmpty()
  @IsString()
  inviteCode: string;

  @IsNotEmpty()
  @IsString()
  publicKey: string;
}
