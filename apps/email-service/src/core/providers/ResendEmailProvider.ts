import { Resend } from 'resend';
import * as hbs from 'handlebars';
import * as fs from 'fs';
import { Injectable } from '@nestjs/common';
import { mapKeys, snakeCase } from 'lodash';
import { TranslateService } from '@common';
import { ParseResponseMessage } from '@common/core/helpers';
interface IAttachments {
  filename: string;
  content: string;
}

interface ITemplateCredentials {
  templateName: string;
  subject: string;
  templateFileName: string;
}

interface IEmailCredentials {
  to: string;
  locale: string;
  attachments?: IAttachments[];
  templateData: Record<string, unknown>;
  templateCredentials: ITemplateCredentials;
}

@Injectable()
class ResendEmailProvider {
  constructor(private translateService: TranslateService) {}

  async sendEmail({
    to,
    locale,
    attachments,
    templateData,
    templateCredentials,
  }: IEmailCredentials) {
    const resend = new Resend(process.env.RESEND_API_KEY);

    const html = this.getHtmlVersionOfTemplate(
      templateCredentials.templateFileName,
      templateData,
      locale,
    );

    const { data, error } = await resend.emails.send({
      from: 'Acme <onboarding@resend.dev>',
      to: [process.env.NODE_ENV === 'production' ? to : 'brtazgun@gmail.com'],
      subject: this.translateService.translate({
        errorConstraints: ParseResponseMessage.parseObjToStr({
          translateFileName: 'mailTemplates',
          path: `TEMPLATES.${snakeCase(
            templateCredentials.templateName.split('.')[0],
          ).toUpperCase()}.SUBJECT`,
        }),
        locale,
      }),
      html,
      attachments: attachments ?? [],
    });

    if (error) {
      console.log('---------');
      console.log(error.name, error.message);
      console.log('---------');
    }

    console.log('*********');
    console.log('Email sent', data);
    console.log('*********');
  }

  getHtmlVersionOfTemplate(
    templateFileName: string,
    templateData: Record<string, unknown>,
    locale: string,
  ) {
    const convertKeysToSnakeCase = mapKeys(templateData, (value, key) => {
      return snakeCase(key).toUpperCase();
    });

    const translateBody = this.translateService.translate({
      errorConstraints: ParseResponseMessage.parseObjToStr({
        translateFileName: 'mailTemplates',
        path: `TEMPLATES.${snakeCase(
          templateFileName.split('.')[0],
        ).toUpperCase()}.BODY`,
        args: {
          otherArgs: convertKeysToSnakeCase,
        },
      }),
      locale,
    });

    const compileLayout = hbs.compile(
      fs.readFileSync(
        './apps/email-service/src/core/templates/layout/layout.hbs',
        'utf-8',
      ),
    );

    const compileHbs = compileLayout({
      BODY: translateBody,
    });

    return compileHbs;
  }
}

export default ResendEmailProvider;
