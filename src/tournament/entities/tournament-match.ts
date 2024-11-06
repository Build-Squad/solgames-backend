import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { Tournament } from './tournament.entity';
import { User } from 'src/user/entities/user.entity';

export enum TournamentGameStatus {
  Awaiting = 'Awaiting', // When the tournament is created but both player's have not joined.
  Scheduled = 'Scheduled', //When both player's have signed up/logged in.
  InProgress = 'InProgress', //When the game has started at the designated time.
  Completed = 'Completed', //When the game is completed, either a winner or someone forfeit.
  Draw = 'Draw', //When the game is draw after being played.
  Expired = 'Expired', //When the player didn't join, either of them. After waiting for 5 minutes max.
}

@Entity()
export class TournamentMatch {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Tournament, { onDelete: 'CASCADE' })
  tournament: Tournament;

  @ManyToOne(() => User, { nullable: false })
  playerOne: User;

  @ManyToOne(() => User, { nullable: false })
  playerTwo: User;

  @ManyToOne(() => User, { nullable: true })
  winner: User;

  @Column({
    type: 'enum',
    enum: TournamentGameStatus,
    default: TournamentGameStatus.Awaiting,
  })
  tournamentGameStatus: TournamentGameStatus;

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
