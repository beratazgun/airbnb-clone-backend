import {
  BadRequestException,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class CheckQueryParamsMiddleware implements NestMiddleware {
  constructor(private i18n: I18nService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const allowedLocales = Object.keys(this.i18n['i18nOptions'].fallbacks);
    const requiredParams = ['locale'];
    const missingParams = requiredParams.filter(
      (param) => !(param in req.query),
    );

    if (missingParams.length > 0) {
      return next(
        new BadRequestException(
          `Missing required query parameters: ${missingParams.join(', ')}`,
        ),
      );
    }

    if (!allowedLocales.includes(req.query.locale as string)) {
      return next(
        new BadRequestException(
          `Invalid locale. Allowed locales: ${allowedLocales.join(', ')}`,
        ),
      );
    }

    next();
  }
}
