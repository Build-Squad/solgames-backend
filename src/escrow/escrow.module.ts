import { Module } from '@nestjs/common';
import { EscrowService } from './escrow.service';
import { EscrowController } from './escrow.controller';
import { Escrow } from './entities/escrow.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EscrowTransaction } from './entities/escrowTransaction.entity';
import { Games } from 'src/games/entities/game.entity';
import { User } from 'src/user/entities/user.entity';
import { AccessCodesModule } from 'src/access-codes/access-codes.module';
import { Withdrawal } from './entities/withdrawal.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Escrow,
      EscrowTransaction,
      Games,
      User,
      Withdrawal,
    ]),
    AccessCodesModule,
  ],
  controllers: [EscrowController],
  providers: [EscrowService],
})
export class EscrowModule {}
