import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Logger } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { QueueNames } from '@common/core/constants';
import { AppModule } from './app.module';
import { join } from 'path';
import * as hbs from 'hbs';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.setViewEngine('hbs');

  app.useStaticAssets(join(__dirname, '../..', 'public'));
  app.setBaseViewsDir(join(__dirname, '../..', 'templates'));
  hbs.registerPartials(join(__dirname, '../..', 'templates', 'partials'));

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RMQ_URL],
      queue: QueueNames.EMAIL_SERVICE_QUEUE,
      noAck: true,
      queueOptions: {
        durable: true,
        prefetchCount: 40,
      },
    },
  });

  await app.startAllMicroservices();
  await app.listen(3002);
  Logger.log(
    `🚀 🚀 🚀 Server running on http://localhost:${process.env.PORT}`,
    'Bootstrap',
  );
}

bootstrap();
