import { Module, Global } from '@nestjs/common';
import { Transport, ClientsModule } from '@nestjs/microservices';
import { QueueNames, ServiceNames } from '@common/core/constants';

@Global()
@Module({
  imports: [
    ClientsModule.register([
      {
        name: ServiceNames.BACKEND_SERVICE,
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RMQ_URL],
          queue: QueueNames.BACKEND_SERVICE_QUEUE,
          prefetchCount: 40,
          isGlobalPrefetchCount: true,
          queueOptions: {
            durable: true,
          },
        },
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class RabbitMQModule {}
