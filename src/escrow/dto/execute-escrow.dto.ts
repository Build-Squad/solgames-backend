import { IsEnum, IsString } from 'class-validator';
import { USER_ROLE } from '../entities/escrowTransaction.entity';

export class XcrowExecuteDto {
  @IsString()
  vaultId: string;

  @IsString()
  signedTransaction: string;

  @IsString()
  transactionId: string;

  @IsString()
  inviteCode: string;

  @IsString()
  userId: string;

  @IsEnum(USER_ROLE)
  userRole: USER_ROLE;
}
