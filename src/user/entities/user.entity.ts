import { AccessCode } from 'src/access-codes/entities/access-code.entity';
import { Games } from 'src/games/entities/game.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  JoinColumn,
  OneToOne,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';

export enum USER_ROLE {
  Creator = 'Creator',
  Acceptor = 'Acceptor',
}
@Entity()
export class User {
  // Relations
  @OneToMany(() => Games, (game) => game.creator)
  createdGames: Games[];

  @OneToMany(() => Games, (game) => game.acceptor)
  acceptedGames: Games[];

  @OneToOne(() => AccessCode, (accessCode) => accessCode.user, {
    nullable: true,
  })
  @JoinColumn()
  accessCode: AccessCode;

  @OneToMany(() => AccessCode, (accessCode) => accessCode.parentAccessCode)
  accessCodeReferrals: AccessCode[];

  // Table columns
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, nullable: true })
  email: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  profileImage: string;

  @Column({ nullable: true })
  typeOfLogin: string;

  @Column({ nullable: true })
  verifier: string;

  @Column({ unique: true, nullable: true })
  verifierId: string;

  @Column({ nullable: true })
  aggregateVerifier: string;

  @Column({ nullable: true, default: false })
  isMfaEnabled: boolean;

  @Column({ nullable: true })
  idToken: string;

  @Column({ unique: true })
  publicKey: string;

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
