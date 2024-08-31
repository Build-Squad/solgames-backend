import { IsString, IsUUID } from 'class-validator';

export class VerifyAccessCodeDto {
  @IsString()
  code: string;

  @IsUUID()
  userId: string;
}
