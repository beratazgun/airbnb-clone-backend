import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ConsumerService } from './consumer.service';
import fromWhereToWhere from '@common/core/helpers/fromWhereToWhere';
import { IBaseEmail } from '@common/core/event/interfaces';

@Controller('consumer')
export class ConsumerController {
  constructor(private readonly consumerService: ConsumerService) {}

  /**
   * !sendEmail
   */
  @MessagePattern(
    fromWhereToWhere({
      from: 'backend',
      to: 'email-service',
      routingKey: 'sendEmail',
    }),
  )
  sendEmail(@Payload() data: IBaseEmail) {
    return this.consumerService.sendEmail(data);
  }
}
