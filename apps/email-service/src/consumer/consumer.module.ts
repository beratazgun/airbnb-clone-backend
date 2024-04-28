import { Module } from '@nestjs/common';
import { ConsumerController } from './consumer.controller';
import { ConsumerService } from './consumer.service';
import ResendEmailProvider from '@email-service/core/providers/ResendEmailProvider';
@Module({
  imports: [],
  controllers: [ConsumerController],
  providers: [ConsumerService, ResendEmailProvider],
})
export class ConsumerModule {}
