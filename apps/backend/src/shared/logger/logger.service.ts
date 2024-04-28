import { Injectable } from '@nestjs/common';
import mongoose, { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { LogAuth } from './schema/logAuth.schema';

const logSchemas = {
  logAuthSchema: 'logAuthModel',
} as const;

interface ILogMethodParams {
  schemaName: keyof typeof logSchemas;
  data: any;
}

@Injectable()
export class LoggerService {
  constructor(
    @InjectModel(LogAuth.name) private logAuthModel: Model<LogAuth>,
  ) {}

  async log({ schemaName, data }: ILogMethodParams) {
    const schema = logSchemas[schemaName];

    await this[schema].create(data);
  }

  // async infoLevel(fields: Omit<LogInterface, 'level'>): Promise<void> {
  //   await this.logAuthModel.create({
  //     message: fields.message,
  //     method: fields.method,
  //     path: fields.path,
  //     headers: fields.headers,
  //     level: 'info',
  //     userAgent: fields.userAgent,
  //     statusCode: fields.statusCode,
  //     ip: fields.ip,
  //   });
  // }
}
