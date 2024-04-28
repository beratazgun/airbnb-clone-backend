import { PrismaModule } from '@common/core/prisma/prisma.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RabbitMQModule } from './core/modules/RabbitMQ.module';
import { ConsumerModule } from './consumer/consumer.module';
import { join } from 'path';
import { TranslateModule } from '@common';
import * as Joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `
        ${
          process.env.NODE_ENV === 'development'
            ? './apps/email-service/src/core/config/.env.development'
            : './apps/email-service/src/core/config/.env.production'
        }`,
      isGlobal: true,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test')
          .default('development'),
      }),
    }),
    TranslateModule.forRoot(join(__dirname, '/i18n/')),
    RabbitMQModule,
    ConsumerModule,
    PrismaModule,
    TranslateModule,
  ],
})
export class AppModule {}
