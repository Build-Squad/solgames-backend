import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { EscrowTransaction } from './escrowTransaction.entity';
import { Withdrawal } from './withdrawal.entity';

@Entity()
export class Escrow {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('decimal', { precision: 20, scale: 8 })
  amount: number;

  @Column({ nullable: true })
  vaultId: string;

  @Column({ nullable: true })
  transactionId: string;

  @Column({ nullable: true })
  transactionHash: string;

  @Column({ unique: true, nullable: true })
  inviteCode: string;

  @OneToMany(() => EscrowTransaction, (transaction) => transaction.escrow, {
    cascade: true,
  })
  transactions: EscrowTransaction[];

  @OneToMany(() => Withdrawal, (withdrawal) => withdrawal.escrow, {
    cascade: true,
  })
  withdrawal: Withdrawal[];

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
