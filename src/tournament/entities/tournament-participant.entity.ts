import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { Tournament } from './tournament.entity';

@Entity()
export class TournamentParticipant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Tournament, (tournament) => tournament.participants, {
    onDelete: 'CASCADE',
  })
  tournament: Tournament;

  @ManyToOne(() => User, { nullable: true })
  user: User;

  @Column({ type: 'varchar', length: 100 })
  alias: string;

  @Column({ unique: true })
  walletAddress: string;

  @CreateDateColumn()
  joinedAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
