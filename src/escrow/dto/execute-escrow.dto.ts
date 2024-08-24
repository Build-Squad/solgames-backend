import { IsString } from 'class-validator';

export class XcrowExecuteDto {
  @IsString()
  vaultId: string;

  @IsString()
  signedTransaction: string;

  @IsString()
  transactionId: string;
}
