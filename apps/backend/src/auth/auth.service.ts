import {
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '@common/core/prisma/prisma.service';
import { NextFunction, Request, Response } from 'express';
import {
  AuthFlowBodyDto,
  ResendVerificationEmailBodyDto,
  ResetPasswordBodyDto,
  SendForgotPasswordLinkBodyDto,
  SigninForWebBodyDto,
  SignupForWebBodyDto,
} from './dtos';
import { omit } from 'lodash';
import GeneratorManager from '@common/core/helpers/GeneratorManager';
import Hashmanager from '@common/core/helpers/HashManager';
import { ServiceNames } from '@common/core/constants';
import { ClientProxy } from '@nestjs/microservices';
import fromWhereToWhere from '@common/core/helpers/fromWhereToWhere';
import {
  AUTH_PROVIDERS_CONST,
  DEFAULT_VALUES_CONST,
} from '@backend/src/core/constants';
import maskEmail from '@backend/src/core/helpers/maskEmail';
import { ParseResponseMessage } from '@common/core/helpers';
import { RedisService, TranslateService } from '@common';
import {
  IAccountConfirmEmailRedis,
  IPasswordResetTokenRedis,
} from '@backend/src/core/interfaces';
import { CsrfService } from '../shared/csrf/csrf.service';
import { SessionManager } from '../core/helpers/SessionManager';
import { IBaseEmail } from '@common/core/event/interfaces';

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    @Inject(ServiceNames.EMAIL_SERVICE)
    private emailClient: ClientProxy,
    private redisService: RedisService,
    private csrfService: CsrfService,
    private translateService: TranslateService,
  ) {}

  /**
   *! signupForWeb
   */
  async signupForWeb(
    body: SignupForWebBodyDto,
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    let registeredUserEmail: string = '';

    if (
      body.password.includes(body.firstName) ||
      body.password.includes(body.lastName) ||
      body.password.includes(body.email.split('@')[0])
    ) {
      return next(
        new UnauthorizedException(
          this.translateService.translate({
            errorConstraints: ParseResponseMessage.parseObjToStr({
              translateFileName: 'authEndpoint',
              path: 'SIGNUP_FOR_WEB.PASSWORD_CONTAIN_SENSITIVE_INFORMATION',
            }),
          }),
        ),
      );
    }

    await this.prismaService.$transaction(async (prisma: PrismaService) => {
      const finderProviderId = await prisma.authStrategy.findFirst({
        where: {
          strategyName: 'local',
        },
      });

      const user = await prisma.users.create({
        data: {
          userSubID: Number(
            GeneratorManager.generateRandomId({
              length: 8,
              type: 'number',
            }),
          ),
          password: (await Hashmanager.hashPassword(body.password)).toString(),
          fullName: body.firstName + ' ' + body.lastName,
          userBirthDay: new Date(
            `${body.userBirthDay.year}-${body.userBirthDay.month}-${body.userBirthDay.day}`,
          ),
          ...omit(body, ['passwordConfirmation', 'password', 'userBirthDay']),
        },
      });

      await prisma.authStrategyToUser.create({
        data: {
          authStrategyID: finderProviderId.id,
          userID: user.id,
        },
      });

      const localeCodes = await prisma.localeCodes.findFirst({
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

      await prisma.userPreference.create({
        data: {
          upSubID: Number(
            GeneratorManager.generateRandomId({
              length: 8,
              type: 'number',
            }),
          ),
          user: {
            connect: {
              id: user.id,
            },
          },
          currency: {
            connect: {
              currencyCode: localeCodes.currency.currencyCode,
            },
          },
          language: {
            connect: {
              language: localeCodes.language.language,
            },
          },
        },
      });

      registeredUserEmail = user.email;
    });

    await this.sendUserVerificationEmail(registeredUserEmail, req);

    res.status(200).json({
      isSuccess: true,
      message: this.translateService.translate({
        errorConstraints: ParseResponseMessage.parseObjToStr({
          translateFileName: 'authEndpoint',
          path: 'SIGNUP_FOR_WEB.SUCCESS_RESPONSE_MESSAGE',
        }),
      }),
      statusCode: 200,
      status: 'OK',
    });
  }

  /**
   * ! signinForWeb
   */
  async signinForWeb(
    body: SigninForWebBodyDto,
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const user = await this.prismaService.users.findFirst({
      where: {
        email: body.email,
        password: {
          not: null,
        },
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

    if (
      !user ||
      !(await Hashmanager.comparePassword(body.password, user.password))
    ) {
      return next(
        new UnauthorizedException(
          this.translateService.translate({
            errorConstraints: ParseResponseMessage.parseObjToStr({
              translateFileName: 'authEndpoint',
              path: 'SIGNIN_FOR_WEB.WRONG_EMAIL_OR_PASSWORD',
            }),
          }),
        ),
      );
    }

    if (!user.isUserRegistrationCompleted) {
      await this.sendUserVerificationEmail(user.email, req);

      return next(
        new UnauthorizedException(
          this.translateService.translate({
            errorConstraints: ParseResponseMessage.parseObjToStr({
              translateFileName: 'authEndpoint',
              path: 'SIGNIN_FOR_WEB.REGISTRATION_NOT_COMPLETED',
            }),
          }),
        ),
      );
    }

    if (
      (user.isUserRegistrationCompleted &&
        !user.isEmailConfirmed &&
        !user.isUserActive) ||
      !user.isEmailConfirmed
    ) {
      await this.sendUserVerificationEmail(user.email, req);

      return next(
        new UnauthorizedException(
          this.translateService.translate({
            errorConstraints: ParseResponseMessage.parseObjToStr({
              translateFileName: 'authEndpoint',
              path: 'SIGNIN_FOR_WEB.EMAIL_NOT_CONFIRMED',
            }),
          }),
        ),
      );
    }

    if (user.isUserBlocked) {
      return next(
        new UnauthorizedException(
          this.translateService.translate({
            errorConstraints: ParseResponseMessage.parseObjToStr({
              translateFileName: 'authEndpoint',
              path: 'SIGNIN_FOR_WEB.ACCOUNT_BLOCKED',
            }),
          }),
        ),
      );
    }

    if (user.isUserDeleted) {
      return next(
        new UnauthorizedException(
          this.translateService.translate({
            errorConstraints: ParseResponseMessage.parseObjToStr({
              translateFileName: 'authEndpoint',
              path: 'SIGNIN_FOR_WEB.ACCOUNT_DELETED',
            }),
          }),
        ),
      );
    }

    if (!user.isUserActive) {
      return next(
        new UnauthorizedException(
          this.translateService.translate({
            errorConstraints: ParseResponseMessage.parseObjToStr({
              translateFileName: 'authEndpoint',
              path: 'SIGNIN_FOR_WEB.ACCOUNT_NOT_ACTIVE',
            }),
          }),
        ),
      );
    }

    SessionManager.setSession({
      req,
      sessionData: {
        ...user,
        userPreference: {
          language: localeCodes.language,
          currency: localeCodes.currency,
          country: localeCodes.country,
        },
      },
    });

    this.csrfService.sendCsrfTokenToClient(req, res);

    res.status(200).json({
      status: 'success',
      statusCode: 200,
      isSuccess: true,
      message: this.translateService.translate({
        errorConstraints: ParseResponseMessage.parseObjToStr({
          translateFileName: 'authEndpoint',
          path: 'SIGNIN_FOR_WEB.SUCCESS_RESPONSE_MESSAGE',
        }),
      }),
    });
  }

  /**
   * ! authFlow
   */
  async authFlow(body: AuthFlowBodyDto, res: Response) {
    const findUser = await this.prismaService.users.findFirst({
      where: {
        email: body.email,
      },
      include: {
        authStrategyToUser: {
          include: {
            authStrategy: true,
          },
        },
      },
    });

    if (!findUser) {
      return res.status(400).json({
        accountExisted: false,
        suggestedAuthMethod: 'EMAIL_AND_PASSWORD',
      });
    }
    const authStrategy = findUser.authStrategyToUser.authStrategy;
    if (authStrategy.strategyName !== AUTH_PROVIDERS_CONST.LOCAL) {
      return res.status(200).json({
        accountExisted: true,
        obfuscatedAccountData: {
          obfuscatedEmail: maskEmail(body.email),
        },
        publicAccountData: {
          firstName: findUser.firstName,
          profileImage: findUser.profileImage,
        },
        suggestedAuthMethod: authStrategy.strategyName.toUpperCase(),
      });
    }
    res.status(200).json({
      accountExisted: true,
      suggestedAuthMethod: 'EMAIL_AND_PASSWORD',
    });
  }

  /**
   * ! sendForgotPasswordLink
   */
  async sendForgotPasswordLink(
    body: SendForgotPasswordLinkBodyDto,
    req: Request,
    res: Response,
  ) {
    const user = await this.prismaService.users.findFirst({
      where: {
        email: body.email,
        isUserRegistrationCompleted: true,
        isUserDeleted: false,
        isUserBlocked: false,
        isEmailConfirmed: true,
        authStrategyToUser: {
          authStrategy: {
            strategyName: 'local',
          },
        },
      },
      include: {
        authStrategyToUser: {
          include: {
            authStrategy: true,
          },
        },
      },
    });

    if (user) {
      const findTemplate = await this.prismaService.mailTemplates.findFirst({
        where: {
          templateName: 'FORGOT_PASSWORD',
        },
        // select: {
        //   templateName: true,
        //   templateSubject: true,
        //   templateContent: true,
        // },
      });

      const passwordResetToken = GeneratorManager.generateRandomId({
        length: 48,
        type: 'textAndNumber',
      });

      await this.redisService.executeCommand<IPasswordResetTokenRedis>(
        (instance, redisKey) =>
          instance.set(
            redisKey({
              prefix: 'passwordResetToken',
              suffix: passwordResetToken,
            }),
            JSON.stringify({
              id: user.id,
              firstName: user.firstName,
              passwordResetToken,
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

      findTemplate &&
        this.emailClient
          .send<string, IBaseEmail>(pattern, {
            to: body.email,
            locale: req.query.locale.toString(),
            templateData: {
              firstName: user.firstName,
              passwordResetUrl: `${process.env.FRONTEND_URL}/reset-password/${passwordResetToken}`,
            },
            templateCredentials: findTemplate,
          })
          .subscribe({
            next: (data) => Logger.log(data),
            error: (err) => console.log(err),
            complete: () => console.log('🎉🎉🎉 Request added to queue 🎉🎉🎉'),
          });
    }
    res.status(200).json({
      isSuccess: true,
      message: this.translateService.translate({
        errorConstraints: ParseResponseMessage.parseObjToStr({
          translateFileName: 'authEndpoint',
          path: 'SEND_FORGOT_PASSWORD_LINK.SUCCESS_RESPONSE_MESSAGE',
          args: {
            otherArgs: {
              EMAIL: [body.email],
            },
          },
        }),
      }),
    });
  }

  /**
   * ! resetPassword
   */
  async resetPassword(
    token: string,
    body: ResetPasswordBodyDto,
    res: Response,
    next: NextFunction,
  ) {
    const getTokenInRedis =
      await this.redisService.executeCommand<IPasswordResetTokenRedis>(
        (instance, redisKey) =>
          instance.get(
            redisKey({
              prefix: 'passwordResetToken',
              suffix: token,
            }),
          ),
        { parseJson: 'parse' },
      );

    if (!getTokenInRedis) {
      return next(
        new UnauthorizedException(
          this.translateService.translate({
            errorConstraints: ParseResponseMessage.parseObjToStr({
              translateFileName: 'authEndpoint',
              path: 'RESET_PASSWORD.WRONG_RESET_TOKEN_OR_INVALID',
            }),
          }),
        ),
      );
    }

    const user = await this.prismaService.users.findUnique({
      where: {
        id: getTokenInRedis.id,
      },
    });

    if (!user) {
      return next(
        new UnauthorizedException(
          this.translateService.translate({
            errorConstraints: ParseResponseMessage.parseObjToStr({
              translateFileName: 'authEndpoint',
              path: 'RESET_PASSWORD.WRONG_RESET_TOKEN_OR_INVALID',
            }),
          }),
        ),
      );
    }

    if (await Hashmanager.comparePassword(body.newPassword, user.password)) {
      return next(
        new UnauthorizedException(
          this.translateService.translate({
            errorConstraints: ParseResponseMessage.parseObjToStr({
              translateFileName: 'authEndpoint',
              path: 'RESET_PASSWORD.PASSWORD_CANNOT_BE_SAME_AS_OLD_PASSWORD',
            }),
          }),
        ),
      );
    }

    if (
      user.isEmailConfirmed === false ||
      user.isUserRegistrationCompleted === false ||
      user.isUserDeleted === true ||
      user.isUserBlocked === true ||
      user.isUserActive === false
    ) {
      return next(
        new UnauthorizedException(
          this.translateService.translate({
            errorConstraints: ParseResponseMessage.parseObjToStr({
              translateFileName: 'authEndpoint',
              path: 'RESET_PASSWORD.YOUR_ACCOUNT_IS_NOT_ACTIVE_OR_DELETED_OR_BLOCKED_OR_NOT_CONFIRMED',
            }),
          }),
        ),
      );
    }

    await this.prismaService.users.update({
      where: {
        id: user.id,
      },
      data: {
        password: (await Hashmanager.hashPassword(body.newPassword)).toString(),
      },
    });

    await this.redisService.executeCommand<IPasswordResetTokenRedis>(
      (instance, redisKey) =>
        instance.del(
          redisKey({
            prefix: 'passwordResetToken',
            suffix: token,
          }),
        ),
    );

    res.status(200).json({
      isSuccess: true,
      message: this.translateService.translate({
        errorConstraints: ParseResponseMessage.parseObjToStr({
          translateFileName: 'authEndpoint',
          path: 'RESET_PASSWORD.SUCCESS_RESPONSE_MESSAGE',
        }),
      }),
    });
  }

  /**
   * ! resendVerificationEmail
   */
  async resendVerificationEmail(
    body: ResendVerificationEmailBodyDto,
    req: Request,
    res: Response,
  ) {
    await this.sendUserVerificationEmail(body.email, req);

    res.status(200).json({
      isSuccess: true,
      message: this.translateService.translate({
        errorConstraints: ParseResponseMessage.parseObjToStr({
          translateFileName: 'authEndpoint',
          path: 'RESEND_VERIFICATION_EMAIL.SUCCESS_RESPONSE_MESSAGE',
          args: {
            otherArgs: {
              EMAIL: body.email,
            },
          },
        }),
      }),
    });
  }

  /**
   * ! sendUserVerificationEmail
   * !! This method is used in signupForWeb and resendVerificationEmail
   */
  private async sendUserVerificationEmail(email: string, req: Request) {
    const emailConfirmToken = GeneratorManager.generateRandomId({
      length: 48,
      type: 'textAndNumber',
    });

    const findUser = await this.prismaService.users.findUnique({
      where: {
        email,
      },
    });

    await this.redisService.executeCommand<IAccountConfirmEmailRedis>(
      (instance, redisKey) =>
        instance.set(
          redisKey({
            prefix: 'accountConfirmEmail',
            suffix: emailConfirmToken,
          }),
          JSON.stringify({
            id: findUser.id,
            firstName: findUser.firstName,
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

    const findTemplate =
      await this.prismaService.mailTemplates.findFirstOrThrow({
        where: {
          templateName: 'WELCOME',
        },
        // select: {
        //   templateName: true,
        //   templateSubject: true,
        //   templateContent: true,
        // },
      });

    findTemplate &&
      this.emailClient
        .send<string, IBaseEmail>(pattern, {
          to: findUser.email,
          locale: req.query.locale.toString(),
          templateData: {
            firstName: findUser.firstName,
            emailConfirmUrl: `${process.env.FRONTEND_URL}/confirm-email/${emailConfirmToken}`,
          },
          templateCredentials: findTemplate,
        })
        .subscribe({
          next: (data) => Logger.log(data),
          error: (err) => console.log(err),
          complete: () => console.log('🎉🎉🎉 Request added to queue 🎉🎉🎉'),
        });
  }
}
