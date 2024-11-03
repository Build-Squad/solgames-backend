import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import configuration from './config/configuration';
import { ValidationPipe } from '@nestjs/common';
import * as fs from 'fs';

const { nodeEnv } = configuration.appConfig;

async function bootstrap() {
  const httpsOptions =
    nodeEnv === 'production'
      ? {
          key: fs.readFileSync(
            '/etc/letsencrypt/live/api.oggames.fun/privkey.pem',
          ),
          cert: fs.readFileSync(
            '/etc/letsencrypt/live/api.oggames.fun/cert.pem',
          ),
        }
      : undefined;

  const app = await NestFactory.create(
    AppModule,
    httpsOptions ? { httpsOptions } : {},
  );
  app.enableCors({
    origin: configuration.appConfig.allowedOrigins,
    methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'HEAD', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(configuration.appConfig.port);
}
bootstrap();
