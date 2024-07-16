import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import configuration from './config/configuration';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: configuration.appConfig.allowedOrigins,
    methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'HEAD', 'PATCH', 'DELETE'],
    credentials: true,
  });
  await app.listen(configuration.appConfig.port);
}
bootstrap();
