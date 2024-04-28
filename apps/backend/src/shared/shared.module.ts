import { Module } from '@nestjs/common';
import { CsrfModule } from './csrf/csrf.module';
import { RedisModule } from '@common';
import { PrismaModule } from '@common/core/prisma/prisma.module';
import { RabbitMQModule } from '../core/modules/RabbitMQ.module';
import { LoggerModule } from './logger/logger.module';
import { AwsS3Module } from './aws/aws-s3/aws-s3.module';

@Module({
  imports: [
    CsrfModule,
    PrismaModule,
    RabbitMQModule,
    RedisModule,
    AwsS3Module,
    // LoggerModule,
  ],
})
export class SharedModule {}
