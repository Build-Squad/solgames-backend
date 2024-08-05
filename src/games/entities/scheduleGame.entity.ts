import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class ScheduleGameJobs {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  jobId: string;

  @Column()
  gameId: string;

  @Column()
  status: string;

  @Column()
  scheduledTime: Date;

  @Column({ nullable: true })
  completedTime?: Date;
}
