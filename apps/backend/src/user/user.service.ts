import { PrismaService } from '@common/core/prisma/prisma.service';
import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { NextFunction, Response, Request } from 'express';
import { ParseResponseMessage } from '@common/core/helpers';
import { RedisService, TranslateService } from '@common';
import { IAccountConfirmEmailRedis } from '@backend/src/core/interfaces';
import Hashmanager from '@common/core/helpers/HashManager';
import { SessionManager } from '@backend/src/core/helpers/SessionManager';
import {
  EmergencyContactBodyDto,
  UpdateEmailBodyDto,
  UpdatePasswordBodyDto,
} from './dtos';
import { omit } from 'lodash';
import GeneratorManager from '@common/core/helpers/GeneratorManager';
import { DEFAULT_VALUES_CONST } from '../core/constants';
import { ClientProxy } from '@nestjs/microservices';
import fromWhereToWhere from '@common/core/helpers/fromWhereToWhere';
import { ServiceNames } from '@common/core/constants';
import { getIp } from '@common/core/helpers/getIp';
import { IBaseEmail } from '@common/core/event/interfaces';
import { DateManager } from '../core/helpers/DateManager';
import * as countries from 'i18n-iso-countries';

@Injectable()
export class UserService {
  constructor(
    private prismaService: PrismaService,
    private translateService: TranslateService,
    private redisService: RedisService,
    @Inject(ServiceNames.EMAIL_SERVICE)
    private emailClient: ClientProxy,
  ) {}
  /**
   * ! confirmEmail
   */
  async confirmEmail(token: string, res: Response, next: NextFunction) {
    const getUserAccountVerificationData =
      await this.redisService.executeCommand<IAccountConfirmEmailRedis>(
        (instance, redisKey) =>
          instance.get(
            redisKey({
              prefix: 'accountConfirmEmail',
              suffix: token,
            }),
          ),
        { parseJson: 'parse' },
      );
    if (!getUserAccountVerificationData) {
      return next(
        new UnauthorizedException(
          this.translateService.translate({
            errorConstraints: ParseResponseMessage.parseObjToStr({
              translateFileName: 'userEndpoint',
              path: 'CONFIRM_EMAIL_FOR_SIGNUP.WRONG_CONFIRM_TOKEN',
            }),
          }),
        ),
      );
    }
    const user = await this.prismaService.users.findUnique({
      where: {
        id: getUserAccountVerificationData.id,
      },
    });

    if (!user) {
      return next(
        new UnauthorizedException(
          this.translateService.translate({
            errorConstraints: ParseResponseMessage.parseObjToStr({
              translateFileName: 'userEndpoint',
              path: 'CONFIRM_EMAIL_FOR_SIGNUP.USER_NOT_FOUND_WITH_PROVIDED_TOKEN',
            }),
          }),
        ),
      );
    }
    await this.prismaService.users.update({
      where: {
        id: getUserAccountVerificationData.id,
      },
      data: {
        emailConfirmedAt: new Date(),
        isUserActive: true,
        isEmailConfirmed: true,
        isUserRegistrationCompleted: true,
      },
    });

    await this.redisService.executeCommand<IAccountConfirmEmailRedis>(
      (instance, redisKey) =>
        instance.del(
          redisKey({
            prefix: 'accountConfirmEmail',
            suffix: token,
          }),
        ),
    );
    res.status(200).json({
      isSuccess: true,
      message: this.translateService.translate({
        errorConstraints: ParseResponseMessage.parseObjToStr({
          translateFileName: 'userEndpoint',
          path: 'CONFIRM_EMAIL_FOR_SIGNUP.SUCCESS_RESPONSE_MESSAGE',
        }),
      }),
      statusCode: 200,
      status: 'OK',
    });
  }

  /**
   * ! getMe
   */
  async getMe(req: Request, res: Response) {
    res.status(200).json({
      fullName: req.session.user.fullName,
      email: req.session.user.email,
    });
  }

  /**
   * ! signout
   */
  async signout(req: Request, res: Response, next: NextFunction) {
    req.session.destroy((err) => {
      if (err) {
        return next(
          new InternalServerErrorException(
            this.translateService.translate({
              errorConstraints: ParseResponseMessage.parseObjToStr({
                translateFileName: 'userEndpoint',
                path: 'SIGNOUT.SOMETHING_WENT_WRONG',
              }),
            }),
          ),
        );
      }
      res.clearCookie('_airbed_session_id');
      res.clearCookie('_csrf_token');
      res.status(200).json({
        status: 'success',
        statusCode: 200,
        isSuccess: true,
      });
    });
  }

  /**
   * ! updatePassword
   */
  async updatePassword(
    body: UpdatePasswordBodyDto,
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const ıp = await getIp(req);
    const user = await this.prismaService.users.findUnique({
      where: {
        id: req.session.user.id,
      },
    });

    const isPasswordMatched = await Hashmanager.comparePassword(
      body.currentPassword,
      user.password,
    );
    if (!isPasswordMatched) {
      return next(
        new UnauthorizedException(
          this.translateService.translate({
            errorConstraints: ParseResponseMessage.parseObjToStr({
              translateFileName: 'userEndpoint',
              path: 'UPDATE_PASSWORD.CURRENT_PASSWORD_NOT_MATCHED',
            }),
          }),
        ),
      );
    }

    const hashedPassword = await Hashmanager.hashPassword(body.newPassword);
    const updatePasswordInDB = await this.prismaService.users.update({
      where: {
        id: req.session.user.id,
      },
      data: {
        password: hashedPassword,
      },
      include: {
        authStrategyToUser: {
          include: {
            authStrategy: true,
          },
        },
      },
    });

    const localeCodes = await this.prismaService.localeCodes.findFirst({
      where: {
        localeCode:
          req.query.locale.toString() || DEFAULT_VALUES_CONST.localeCode,
      },
      include: {
        country: true,
        language: true,
        currency: true,
      },
    });

    SessionManager.setSession({
      req,
      sessionData: {
        ...updatePasswordInDB,
        userPreference: {
          language: localeCodes.language,
          currency: localeCodes.currency,
          country: localeCodes.country,
        },
      },
    });

    const pattern = fromWhereToWhere({
      from: 'backend',
      to: 'email-service',
      routingKey: 'sendEmail',
    });

    const findTemplates =
      await this.prismaService.mailTemplates.findFirstOrThrow({
        where: {
          templateName: 'PASSWORD_HAS_BEEN_CHANGED',
        },
      });

    findTemplates &&
      this.emailClient
        .send<string, IBaseEmail>(pattern, {
          to: req.session.user.email,
          locale: req.query.locale.toString(),
          templateData: {
            passwordChangedAt:
              DateManager.formatDate({
                date: new Date(),
                formatString: 'formattedDateTime',
                locale: req.query.locale.toString(),
              }) + ' UTC',
            passwordChangedFrom:
              ıp.state_prov +
              ', ' +
              countries.getName(
                ıp.country_code2,
                req.query.locale.toString().split('-')[0],
              ),
            deviceType: req.headers['user-agent'],
            checkOutMyAccountUrl: `${process.env.FRONTEND_URL}`, // TODO: CHECK_OUT_MY_ACCOUNT_URL,
          },
          templateCredentials: omit(findTemplates, ['id']),
        })
        .subscribe({
          next: (data) => Logger.log(data),
          error: (err) => console.log(err),
          complete: () => console.log('🎉🎉🎉 Request added to queue 🎉🎉🎉'),
        });
    res.status(200).json({
      isSuccess: true,
      statusCode: 200,
      status: 'OK',
      message: this.translateService.translate({
        errorConstraints: ParseResponseMessage.parseObjToStr({
          translateFileName: 'userEndpoint',
          path: 'UPDATE_PASSWORD.SUCCESS_RESPONSE_MESSAGE',
        }),
      }),
    });
  }

  /**
   * ! createEmergencyContactMutation
   */
  async createEmergencyContact(
    body: EmergencyContactBodyDto,
    req: Request,
    res: Response,
    session: Record<string, any>,
  ) {
    const constData = {
      language: {
        connect: {
          language: body.preferedLang,
        },
      },
      user: {
        connect: {
          id: req.session.user.id,
        },
      },
    };

    await this.prismaService.emergencyContactPerson.upsert({
      where: {
        userID: session.user.id,
      },
      update: {
        ...omit(body, ['preferedLang']),
        ...constData,
      },
      create: {
        ecpSubID: Number(
          GeneratorManager.generateRandomId({
            length: 8,
            type: 'number',
          }),
        ),
        ...omit(body, ['preferedLang']),
        ...constData,
      },
      include: {
        language: true,
      },
    });

    res.status(200).json({
      isSuccess: true,
      statusCode: 200,
      status: 'OK',
    });
  }

  /**
   * ! updateEmail
   */
  async updateEmail(
    body: UpdateEmailBodyDto,
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const ıp = await getIp(req);
    const isEmailExist = await this.prismaService.users.findFirst({
      where: {
        email: body.email,
      },
    });

    if (isEmailExist) {
      return next(
        new UnauthorizedException(
          this.translateService.translate({
            errorConstraints: ParseResponseMessage.parseObjToStr({
              translateFileName: 'userEndpoint',
              path: 'UPDATE_EMAIL.EMAIL_ALREADY_EXISTS',
            }),
          }),
        ),
      );
    }

    const updatedUser = await this.prismaService.users.update({
      where: {
        id: req.session.user.id,
      },
      data: {
        email: body.email,
        isEmailConfirmed: false,
        isUserActive: false,
      },
    });

    const emailConfirmToken = GeneratorManager.generateRandomId({
      length: 48,
      type: 'textAndNumber',
    });

    await this.redisService.executeCommand<IAccountConfirmEmailRedis>(
      (instance, redisKey) =>
        instance.set(
          redisKey({
            prefix: 'accountConfirmEmail',
            suffix: emailConfirmToken,
          }),
          JSON.stringify({
            id: updatedUser.id,
            firstName: updatedUser.firstName,
            emailConfirmToken,
          }),
          'EX',
          10 * 60,
        ),
    );

    const pattern = fromWhereToWhere({
      from: 'backend',
      to: 'email-service',
      routingKey: 'sendEmail',
    });

    const findTemplates = await this.prismaService.mailTemplates.findMany({
      where: {
        OR: [
          { templateName: 'UPDATE_EMAIL' },
          { templateName: 'EMAIL_ADDRESS_HAS_BEEN_CHANGED' },
        ],
      },
    });

    findTemplates.length === 2 &&
      this.emailClient
        .send<string, IBaseEmail>(pattern, {
          to: updatedUser.email,
          locale: req.query.locale.toString(),
          templateData: {
            firstName: updatedUser.firstName,
            emailConfirmUrl: `${process.env.FRONTEND_URL}/confirm-email/${emailConfirmToken}`,
          },
          templateCredentials: omit(
            findTemplates.find((el) => el.templateName === 'UPDATE_EMAIL'),
            ['id'],
          ),
        })
        .subscribe({
          next: (data) => Logger.log(data),
          error: (err) => console.log(err),
          complete: () => console.log('🎉🎉🎉 Request added to queue 🎉🎉🎉'),
        });

    findTemplates.length === 2 &&
      this.emailClient
        .send<string, IBaseEmail>(pattern, {
          to: req.session.user.email,
          locale: req.query.locale.toString(),
          templateData: {
            newEmail: body.email,
            emailChangedAt:
              DateManager.formatDate({
                date: new Date(),
                formatString: 'formattedDateTime',
                locale: req.query.locale.toString(),
              }) + ' UTC',
            emailChangedFrom:
              ıp.state_prov +
              ', ' +
              countries.getName(
                ıp.country_code2,
                req.query.locale.toString().split('-')[0],
              ),
            deviceType: req.headers['user-agent'],
            reviewAccountLink: `${process.env.FRONTEND_URL}`, // TODO: Review account link
          },
          templateCredentials: omit(
            findTemplates.find(
              (el) => el.templateName === 'EMAIL_ADDRESS_HAS_BEEN_CHANGED',
            ),
            ['id'],
          ),
        })
        .subscribe({
          next: (data) => Logger.log(data),
          error: (err) => console.log(err),
          complete: () => console.log('🎉🎉🎉 Request added to queue 🎉🎉🎉'),
        });

    req.session.user = {
      ...req.session.user,
      email: body.email,
    };

    res.status(200).json({
      isSuccess: true,
      statusCode: 200,
      status: 'OK',
      message: this.translateService.translate({
        errorConstraints: ParseResponseMessage.parseObjToStr({
          translateFileName: 'userEndpoint',
          path: 'UPDATE_EMAIL.SUCCESS_RESPONSE_MESSAGE',
        }),
      }),
    });
  }
}
