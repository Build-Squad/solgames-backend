import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SocketModule } from './socket/socket.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import configuration from './config/configuration';
import { GamesModule } from './games/games.module';
import { User } from './user/entities/user.entity';
import { Games } from './games/entities/game.entity';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bull';
import { ScheduleGameJobs } from './games/entities/scheduleGame.entity';
import { EscrowModule } from './escrow/escrow.module';
import { Escrow } from './escrow/entities/escrow.entity';
import { EscrowTransaction } from './escrow/entities/escrowTransaction.entity';
import { AccessCodesModule } from './access-codes/access-codes.module';
import { AccessCode } from './access-codes/entities/access-code.entity';
import { Withdrawal } from './escrow/entities/withdrawal.entity';

const { db_host, db_name, db_password, db_username, db_synchronize, db_ssl } =
  configuration.databaseConfig;

const sslOptions = db_ssl === 'true' ? { rejectUnauthorized: false } : false;

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: db_host,
      port: 5432,
      password: db_password,
      username: db_username,
      entities: [
        User,
        Games,
        ScheduleGameJobs,
        Escrow,
        EscrowTransaction,
        AccessCode,
        Withdrawal,
      ],
      database: db_name,
      synchronize: !!db_synchronize,
      logging: true,
      ssl: sslOptions,
    }),
    ScheduleModule.forRoot(),
    BullModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379,
      },
    }),
    SocketModule,
    UserModule,
    GamesModule,
    EscrowModule,
    AccessCodesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
