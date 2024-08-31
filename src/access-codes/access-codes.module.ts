import { Module } from '@nestjs/common';
import { AccessCodesService } from './access-codes.service';
import { AccessCodesController } from './access-codes.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { AccessCode } from './entities/access-code.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AccessCode, User])],
  controllers: [AccessCodesController],
  providers: [AccessCodesService],
})
export class AccessCodesModule {}
