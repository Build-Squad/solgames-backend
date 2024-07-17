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
