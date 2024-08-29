import { Module } from '@nestjs/common';
import { EscrowService } from './escrow.service';
import { EscrowController } from './escrow.controller';
import { Escrow } from './entities/escrow.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EscrowTransaction } from './entities/escrowTransaction.entity';
import { Games } from 'src/games/entities/game.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Escrow, EscrowTransaction, Games])],
  controllers: [EscrowController],
  providers: [EscrowService],
})
export class EscrowModule {}
