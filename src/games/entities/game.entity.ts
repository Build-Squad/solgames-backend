import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity()
export class Game {
  // Relations
  @ManyToOne(() => User, (user) => user.createdGames, { nullable: true })
  @JoinColumn({ name: 'creatorId' })
  creator: User;

  @ManyToOne(() => User, (user) => user.acceptedGames, { nullable: true })
  @JoinColumn({ name: 'acceptorId' })
  acceptor: User;

  //   Table columns
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  token: string;

  @Column('decimal', { precision: 18, scale: 8 })
  betAmount: number;

  @Column()
  inviteCode: string;

  @Column('timestamp')
  gameDateTime: Date;

  @Column({ default: false })
  isGameAccepted: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
