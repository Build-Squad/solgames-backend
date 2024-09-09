import { User } from 'src/user/entities/user.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToOne,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';

@Entity()
export class AccessCode {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  code: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: 0 })
  usedCount: number;

  // One-to-One relationship with User for the access code assigned to this user
  @OneToOne(() => User, (user) => user.accessCode, { onDelete: 'SET NULL' })
  user: User;

  // Many-to-One relationship to link to the original access code used for creation
  @ManyToOne(() => User, (user) => user.accessCodeReferrals, { nullable: true })
  parentAccessCode: User;

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
