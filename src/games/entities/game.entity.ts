import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';

enum GameStatus {
  Scheduled = 'Scheduled', //When a user creates a game.
  Accepted = 'Accepted', //When the opponent accepts the game.
  InProgress = 'InProgress', //When both players have joined and the game is started.
  Completed = 'Completed', //When the game is completed, either a winner or someone forfeit.
  Draw = 'Draw', //When the game is draw after being played.
  Expired = 'Expired', //When the player didn't join, either of them. After waiting for 5 minutes max.
}

@Entity()
export class Games {
  // Relations
  @ManyToOne(() => User, (user) => user.createdGames, { nullable: true })
  @JoinColumn({ name: 'creatorId' })
  creator: User;

  @ManyToOne(() => User, (user) => user.acceptedGames, { nullable: true })
  @JoinColumn({ name: 'acceptorId' })
  acceptor: User;

  //   Table columns
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  creatorId: string;

  @Column({ nullable: true })
  acceptorId: string;

  @Column({ nullable: true })
  winnerId: string;

  @Column({ default: 'SOL' })
  token: string;

  @Column('decimal', { precision: 18, scale: 8 })
  betAmount: number;

  @Column()
  inviteCode: string;

  @Column('timestamp')
  gameDateTime: Date;

  @Column({ default: false })
  isGameAccepted: boolean;

  @Column({
    type: 'enum',
    enum: GameStatus,
    default: GameStatus.Scheduled,
  })
  gameStatus: GameStatus;

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
