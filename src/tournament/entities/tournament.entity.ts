import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { TournamentParticipant } from './tournament-participant.entity';
import { User } from 'src/user/entities/user.entity';

export enum TournamentType {
  OneVsOne = '1v1',
  SingleElimination = 'Single Elimination',
  RoundRobin = 'Round Robin',
  League = 'League',
}

export enum TournamentStatus {
  Scheduled = 'Scheduled',
  Ongoing = 'Ongoing',
  Completed = 'Completed',
  Cancelled = 'Cancelled',
}

@Entity()
export class Tournament {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  tournamentName: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: TournamentType,
  })
  tournamentType: TournamentType;

  @Column({ type: 'int' })
  numberOfParticipants: number;

  @OneToMany(
    () => TournamentParticipant,
    (participant) => participant.tournament,
    {
      cascade: true,
    },
  )
  participants: TournamentParticipant[];

  @Column('decimal', { precision: 20, scale: 8 })
  rewardAmount: number;

  @Column('timestamp')
  tournamentDateTime: Date;

  @Column({
    type: 'enum',
    enum: TournamentStatus,
    default: TournamentStatus.Scheduled,
  })
  status: TournamentStatus;

  @ManyToOne(() => User, { nullable: true })
  createdBy: User;

  @ManyToOne(() => User, { nullable: true })
  winner: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
