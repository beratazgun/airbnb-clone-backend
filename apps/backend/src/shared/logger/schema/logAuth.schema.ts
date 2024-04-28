import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Document } from 'mongoose';

export type LogDocument = HydratedDocument<LogAuth>;

@Schema({ timestamps: true, collection: 'log_auth' })
export class LogAuth extends Document {
  @Prop({
    type: String,
    required: true,
  })
  message: string;

  @Prop({
    type: Object,
    required: true,
  })
  request: string;

  @Prop({
    type: Object,
    required: true,
  })
  response: string;

  @Prop({
    type: String,
    required: true,
    enum: ['error', 'warn', 'info', 'verbose', 'debug', 'silly'],
  })
  level: string;

  @Prop({
    type: String,
    required: true,
  })
  userAgent: string;
}

export const LogAuthSchema = SchemaFactory.createForClass(LogAuth);
