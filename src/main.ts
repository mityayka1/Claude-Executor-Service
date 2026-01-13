import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { ApiKeyGuard } from './common/guards/api-key.guard';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.useGlobalGuards(new ApiKeyGuard(configService));

  app.enableCors();

  const port = configService.get<number>('port') || 3000;
  const apiKeyConfigured = !!configService.get<string>('apiKey');

  await app.listen(port);
  logger.log(`Claude Executor Service is running on port ${port}`);
  logger.log(`API Key authentication: ${apiKeyConfigured ? 'ENABLED' : 'DISABLED (set API_KEY to enable)'}`);
}

bootstrap();
