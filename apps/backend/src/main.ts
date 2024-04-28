import { BadRequestException, Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '@backend/src/app.module';
import * as cookieParser from 'cookie-parser';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { QueueNames } from '@common/core/constants';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { I18nValidationExceptionFilter, I18nValidationPipe } from 'nestjs-i18n';
import * as sessions from 'express-session';
import RedisStore from 'connect-redis';
import { ConfigService } from '@nestjs/config';
import { snakeCase } from 'lodash';
import { RedisService } from '@common';
import helmet from 'helmet';
import * as requestIp from 'request-ip';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);
  const redisService = app.get(RedisService);

  app.use(cookieParser());
  app.setGlobalPrefix('api/v1');
  app.enableCors({
    credentials: true,
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  });

  app.use(requestIp.mw());

  app.use(
    helmet({
      xssFilter: true, // XSS attack
      frameguard: true, // Clickjacking
      hsts: true, // HTTP Strict Transport Security
      noSniff: true, // MIME sniffing
      hidePoweredBy: true, // Hide X-Powered-By
    }),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: (errors) => new BadRequestException(errors),
      whitelist: true,
    }),
  );

  app.useGlobalPipes(new I18nValidationPipe());
  app.useGlobalFilters(
    new I18nValidationExceptionFilter({
      detailedErrors: false,
    }),
  );

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RMQ_URL],
      queue: QueueNames.BACKEND_SERVICE_QUEUE,
      noAck: true,
      queueOptions: {
        durable: true,
        prefetchCount: 40,
      },
    },
  });

  const config = new DocumentBuilder()
    .setTitle('Airbnb Backend Clone API')
    .setDescription('The Airbnb Backend Clone API description')
    .setVersion('1.0')
    .addTag('auth', 'Auth API')
    .addTag('google-auth', 'Google Auth API')
    .addTag('property', 'property API')
    .addTag('images', 'images API')
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    deepScanRoutes: true,
    operationIdFactory: (controllerKey: string, methodKey: string) => {
      return snakeCase(methodKey).replace(/_/g, ' ');
    },
  });
  SwaggerModule.setup('api/v1/doc', app, document);

  app.use(
    sessions({
      store: new RedisStore({
        client: redisService.connection(),
        prefix: '_airbed_session_id#',
      }),
      name: '_airbed_session_id',
      secret: configService.get<string>('SESSION_SECRET'),
      cookie: {
        httpOnly: true,
        maxAge: configService.get<number>('SESSION_EXPIRATION') * 1000,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      },
      resave: true,
      saveUninitialized: false,
    }),
  );

  await app.startAllMicroservices();
  await app.listen(process.env.PORT);
  Logger.log(
    `🚀 🚀 🚀 Server running on http://localhost:${process.env.PORT}`,
    'Bootstrap',
  );
}

bootstrap();
