import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GameModule } from './game/game.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import configuration from './config/configuration';
import { User } from './user/entities/user.entity';

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
      entities: [User],
      database: db_name,
      synchronize: true,
      logging: true,
    }),
    GameModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
