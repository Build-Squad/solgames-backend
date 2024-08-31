// create-access-code.dto.ts
import { IsBoolean, IsOptional, IsUUID } from 'class-validator';

export class CreateAccessCodeDto {
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsUUID()
  userId: string;

  @IsUUID()
  @IsOptional()
  parentAccessCodeId?: string;
}
