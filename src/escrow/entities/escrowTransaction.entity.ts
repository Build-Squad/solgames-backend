// This table is to store all the transactions that happens in a particular escrow
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { Escrow } from './escrow.entity';

enum USER_ROLE {
  Creator = 'Creator',
  Acceptor = 'Acceptor',
  Admin = 'Admin',
  Player = 'Player',
}

export enum ESCROW_TRANSACTION_STATUS {
  Pending = 'Pending',
  Completed = 'Completed',
  Expired = 'Expired',
}

export enum ESCROW_TRANSACTION_TYPE {
  Deposit = 'Deposit',
  Withdrawal = 'Withdrawal',
}

@Entity()
export class EscrowTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Escrow, (escrow) => escrow.transactions)
  escrow: Escrow;

  @Column({ type: 'enum', enum: ESCROW_TRANSACTION_TYPE, nullable: true })
  transactionType: ESCROW_TRANSACTION_TYPE;

  @Column('decimal', { precision: 20, scale: 8 })
  amount: number;

  @Column()
  transactionHash: string;

  @Column()
  userId: string;

  @Column({ nullable: true })
  transactionId: string;

  @Column({ type: 'enum', enum: USER_ROLE })
  role: USER_ROLE;

  @Column({ type: 'enum', enum: ESCROW_TRANSACTION_STATUS })
  status: ESCROW_TRANSACTION_STATUS;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  updateDatesBeforeInsert() {
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  @BeforeUpdate()
  updateDatesBeforeUpdate() {
    this.updatedAt = new Date();
  }
}
