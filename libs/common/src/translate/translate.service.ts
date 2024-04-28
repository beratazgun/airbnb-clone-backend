import { Injectable } from '@nestjs/common';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { ParseResponseMessage } from '@common/core/helpers/ParseResponseMessage';
import { snakeCase } from 'lodash';

interface ITranslateParams {
  errorConstraints: string;
  locale?: string;
}

@Injectable()
export class TranslateService {
  constructor(private readonly i18n: I18nService) {}

  translate({ errorConstraints, locale }: ITranslateParams): string {
    const context = I18nContext.current();

    const parseErrorConstraints =
      ParseResponseMessage.parseStrToObj(errorConstraints);

    return this.i18n.translate(`${parseErrorConstraints.message}`, {
      args: {
        ...parseErrorConstraints.args.otherArgs,
        ...this.translateFields(
          parseErrorConstraints.args.translatable?.fields,
        ),
      },
      lang: context?.lang ?? locale,
    });
  }

  protected translateFields(
    fields: { [key: string]: string },
    locale?: string,
  ) {
    const context = I18nContext.current();
    if (!fields) {
      return {};
    }

    const result = Object.entries(fields).reduce((acc, [key, value]) => {
      return {
        ...acc,
        [key]: this.i18n.translate(`fields.${snakeCase(value).toUpperCase()}`, {
          args: {
            fields: value,
          },
          lang: context.lang ?? locale,
        }),
      };
    }, {});

    return result;
  }
}
