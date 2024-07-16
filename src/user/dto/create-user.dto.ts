import { IsEmail, IsString, IsBoolean, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  @IsOptional()
  email: string;

  @IsString()
  @IsOptional()
  name: string;

  @IsString()
  @IsOptional()
  profileImage: string;

  @IsString()
  typeOfLogin: string;

  @IsString()
  verifier: string;

  @IsString()
  verifierId: string;

  @IsString()
  aggregateVerifier: string;

  @IsBoolean()
  isMfaEnabled: boolean;

  @IsString()
  idToken: string;

  @IsString()
  publicKey: string;
}
