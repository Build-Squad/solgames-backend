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
  @IsOptional()
  typeOfLogin: string;

  @IsString()
  @IsOptional()
  verifier: string;

  @IsString()
  @IsOptional()
  verifierId: string;

  @IsString()
  @IsOptional()
  aggregateVerifier: string;

  @IsBoolean()
  @IsOptional()
  isMfaEnabled: boolean;

  @IsString()
  @IsOptional()
  idToken: string;

  @IsString()
  @IsOptional()
  publicKey: string;
}
