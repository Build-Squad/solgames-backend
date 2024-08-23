import { IsNotEmpty, IsString, IsNumber, Min } from 'class-validator';

export class CreateEscrowDto {
  @IsNotEmpty()
  @IsString()
  publicKey: string;

  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  amount: number;
}
