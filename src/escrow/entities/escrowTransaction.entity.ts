import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Escrow } from './escrow.entity';

export enum USER_ROLE {
  Creator = 'Creator',
  Acceptor = 'Acceptor',
}
export enum ESCROW_TRANSACTION_STATUS {
  Pending = 'Pending',
  Completed = 'Completed',
  Expired = 'Expired',
}

@Entity()
export class EscrowTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Escrow, (escrow) => escrow.transactions)
  escrow: Escrow;

  @Column('decimal', { precision: 20, scale: 8 })
  amount: number;

  @Column()
  transactionHash: string;

  @Column()
  userId: string;

  @Column({ type: 'enum', enum: USER_ROLE })
  role: USER_ROLE;

  @Column({ type: 'enum', enum: ESCROW_TRANSACTION_STATUS })
  status: ESCROW_TRANSACTION_STATUS;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
