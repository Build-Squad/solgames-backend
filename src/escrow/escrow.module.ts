import { Module } from '@nestjs/common';
import { EscrowService } from './escrow.service';
import { EscrowController } from './escrow.controller';
import { Escrow } from './entities/escrow.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Escrow])],
  controllers: [EscrowController],
  providers: [EscrowService],
})
export class EscrowModule {}
