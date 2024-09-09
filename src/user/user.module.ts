import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { AccessCode } from 'src/access-codes/entities/access-code.entity';
import { Withdrawal } from 'src/escrow/entities/withdrawal.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, AccessCode, Withdrawal])],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
