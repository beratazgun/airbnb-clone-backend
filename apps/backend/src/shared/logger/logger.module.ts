import { Global, Module } from '@nestjs/common';
import { LoggerService } from './logger.service';
import { MongooseModule } from '@nestjs/mongoose';
import { LogAuthSchema } from './schema/logAuth.schema';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'LogAuth', schema: LogAuthSchema }]),
  ],
  providers: [LoggerService],
  exports: [LoggerService],
})
export class LoggerModule {}
