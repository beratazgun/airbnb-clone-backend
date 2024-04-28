import { Global, Module } from '@nestjs/common';
import { RedisService } from './redis/redis.service';
import { RedisModule } from './redis/redis.module';

@Global()
@Module({
  providers: [RedisService],
  imports: [RedisModule],
})
export class CommonModule {}
