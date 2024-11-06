import { IsEnum, IsString } from 'class-validator';
import { USER_ROLE } from 'src/user/entities/user.entity';

export class XcrowExecuteDto {
  @IsString()
  vaultId: string;

  @IsString()
  signedTransaction: string;

  @IsString()
  transactionId: string;

  @IsString()
  userId: string;

  @IsEnum(USER_ROLE)
  userRole: USER_ROLE;
}
