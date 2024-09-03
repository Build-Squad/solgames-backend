import { Games } from 'src/games/entities/game.entity';
import { User } from 'src/user/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { Escrow } from './escrow.entity';

@Entity()
export class Withdrawal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Escrow, (escrow) => escrow.withdrawal)
  escrow: Escrow;

  @ManyToOne(() => User, (user) => user.withdrawals, { nullable: false })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Games, (game) => game.withdrawals, { nullable: false })
  @JoinColumn({ name: 'gameId' })
  game: Games;

  @Column('decimal', { precision: 20, scale: 8 })
  amount: number;

  @Column({ nullable: false })
  transactionId: string;

  @Column()
  transactionHash: string;

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
