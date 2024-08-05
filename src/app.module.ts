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

const { db_host, db_name, db_password, db_username } =
  configuration.databaseConfig;

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: db_host,
      port: 5432,
      password: db_password,
      username: db_username,
      entities: [User, Games, ScheduleGameJobs],
      database: db_name,
      synchronize: true,
      logging: true,
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
