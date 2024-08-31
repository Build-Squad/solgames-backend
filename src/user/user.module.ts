import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { AccessCode } from 'src/access-codes/entities/access-code.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, AccessCode])],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
