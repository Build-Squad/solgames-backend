import { Games } from 'src/games/entities/game.entity';
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';

@Entity()
export class User {
  // Relations
  @OneToMany(() => Games, (game) => game.creator)
  createdGames: Games[];

  @OneToMany(() => Games, (game) => game.acceptor)
  acceptedGames: Games[];

  // Table columns
  @PrimaryGeneratedColumn('uuid')
  id: number;

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

  @Column({ default: false })
  isMfaEnabled: boolean;

  @Column('text')
  idToken: string;

  @Column({ unique: true })
  publicKey: string;
}