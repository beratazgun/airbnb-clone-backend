import { CsrfService } from '@backend/src/shared/csrf/csrf.service';
import { RedisService, TranslateService } from '@common';
import { ParseResponseMessage } from '@common/core/helpers';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { SessionData } from 'express-session';

@Injectable()
export class AuthorizationGuard implements CanActivate {
  constructor(
    private redisService: RedisService,
    private translateService: TranslateService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    const isUserSignedIn = await this.redisService.executeCommand<SessionData>(
      (instance, redisKey) =>
        instance.get(
          redisKey({
            prefix: '_airbed_session_id',
            suffix: request.sessionID,
          }),
        ),
      {
        parseJson: 'parse',
      },
    );

    if (!isUserSignedIn) {
      throw new UnauthorizedException(
        this.translateService.translate({
          errorConstraints: ParseResponseMessage.parseObjToStr({
            translateFileName: 'guards',
            path: 'GUARDS.AUTHORIZATON_GUARD.NOT_AUTHORIZED',
          }),
        }),
      );
    }

    if (request.cookies._csrf_token !== isUserSignedIn._csrf_token) {
      request.session.destroy((err) => {
        if (err) {
          throw new UnauthorizedException(
            this.translateService.translate({
              errorConstraints: ParseResponseMessage.parseObjToStr({
                translateFileName: 'guards',
                path: 'GUARDS.AUTHORIZATON_GUARD.COULD_NOT_DESTROY_SESSION',
              }),
            }),
          );
        }
      });

      response.clearCookie('_airbed_session_id	');
      response.clearCookie('_csrf_token');
      return false;
    }

    return true;
  }
}
