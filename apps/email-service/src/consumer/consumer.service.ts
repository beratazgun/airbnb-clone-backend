import { IBaseEmail } from '@common/core/event/interfaces';
import ResendEmailProvider from '@email-service/core/providers/ResendEmailProvider';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ConsumerService {
  constructor(private readonly resendEmailProvider: ResendEmailProvider) {}

  async sendEmail({
    to,
    locale,
    templateData,
    templateCredentials,
  }: IBaseEmail) {
    await this.resendEmailProvider.sendEmail({
      to,
      locale,
      templateData,
      templateCredentials,
    });
  }
}
