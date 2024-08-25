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

@Entity()
export class Escrow {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('decimal', { precision: 20, scale: 8 })
  amount: number;

  @Column({ nullable: true })
  vaultId: string;

  @Column({ unique: true })
  inviteCode: string;

  @OneToMany(() => EscrowTransaction, (transaction) => transaction.escrow, {
    cascade: true,
  })
  transactions: EscrowTransaction[];

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
