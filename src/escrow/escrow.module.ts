import { Module } from '@nestjs/common';
import { EscrowService } from './escrow.service';
import { EscrowController } from './escrow.controller';
import { Escrow } from './entities/escrow.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EscrowTransaction } from './entities/escrowTransaction.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Escrow, EscrowTransaction])],
  controllers: [EscrowController],
  providers: [EscrowService],
})
export class EscrowModule {}
