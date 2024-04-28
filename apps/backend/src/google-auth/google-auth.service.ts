import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '@common/core/prisma/prisma.service';
import { NextFunction, Request, Response } from 'express';
import GeneratorManager from '@common/core/helpers/GeneratorManager';
import { ConfigService } from '@nestjs/config';
import { GoogleSigninCompleteRegistrationBodyDto } from './dtos/GoogleSigninCompleteRegistrationBody.dto';
import { ParseResponseMessage } from '@common/core/helpers';
import { TranslateService } from '@common';
import { SessionManager } from '../core/helpers/SessionManager';
import { CsrfService } from '../shared/csrf/csrf.service';
import { DEFAULT_VALUES_CONST } from '../core/constants/DefaultValues.const';

@Injectable()
export class GoogleAuthService {
  constructor(
    private prismaService: PrismaService,
    private configService: ConfigService,
    private translateService: TranslateService,
    private csrfService: CsrfService,
  ) {}
  /**
   * ! googleSigninCallback
   */
  async googleSigninCallback(req: Request, res: Response, next: NextFunction) {
    let accessToken: string = '';

    if (req.user['accessToken']) {
      accessToken = req.user['accessToken'];
      const isUserExist = await this.prismaService.users.findFirst({
        where: {
          email: req.user['email'],
          authStrategyToUser: {
            authStrategy: {
              strategyName: 'google',
            },
          },
        },
        include: {
          authStrategyToUser: {
            where: {
              authStrategy: {
                strategyName: 'google',
              },
            },
            include: {
              authStrategy: true,
            },
          },
          userPreference: {
            include: {
              language: true,
              currency: true,
            },
          },
        },
      });

      if (!isUserExist) {
        await this.prismaService.$transaction(async (prisma: PrismaService) => {
          const user = await prisma.users.create({
            data: {
              userSubID: Number(
                GeneratorManager.generateRandomId({
                  length: 8,
                  type: 'number',
                }),
              ),
              firstName: req.user['firstName'],
              email: req.user['email'],
              profileImage: req.user['profileImage'],
              isEmailConfirmed: true,
              emailConfirmedAt: new Date(),
            },
          });

          await prisma.authStrategyToUser.create({
            data: {
              accessToken,
              user: {
                connect: {
                  id: user.id,
                },
              },
              authStrategy: {
                connect: {
                  strategyName: 'google',
                },
              },
            },
          });

          return res.status(400).json({
            status: 'error',
            statusCode: 400,
            isSuccess: false,
            message: this.translateService.translate({
              errorConstraints: ParseResponseMessage.parseObjToStr({
                translateFileName: 'googleAuthEndpoint',
                path: 'GOOGLE_SIGNIN_CALLBACK.REGISTRATION_NOT_COMPLETED_RESPONSE',
              }),
            }),
            payload: {
              firstName: user.firstName,
              email: user.email,
              userSubID: user.userSubID,
              isRegistrationCompleted: user.isUserRegistrationCompleted,
            },
          });
        });
      } else {
        if (!isUserExist.isUserRegistrationCompleted) {
          res.status(400).json({
            status: 'error',
            statusCode: 400,
            isSuccess: false,
            message: this.translateService.translate({
              errorConstraints: ParseResponseMessage.parseObjToStr({
                translateFileName: 'googleAuthEndpoint',
                path: 'GOOGLE_SIGNIN_CALLBACK.REGISTRATION_NOT_COMPLETED_RESPONSE',
              }),
            }),
            payload: {
              firstName: isUserExist.firstName,
              email: isUserExist.email,
              userSubID: isUserExist.userSubID,
              isRegistrationCompleted: isUserExist.isUserRegistrationCompleted,
            },
          });
        } else {
          await this.prismaService.authStrategyToUser.updateMany({
            where: {
              userID: isUserExist.id,
              authStrategy: {
                strategyName: 'google',
              },
            },
            data: {
              accessToken,
            },
          });

          const localeCodes = await this.prismaService.localeCodes.findFirst({
            where: {
              primaryLanguageSubtag:
                req.user['locale'] ||
                DEFAULT_VALUES_CONST.localeCode.split('-')[0],
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
              ...isUserExist,
              userPreference: {
                language: localeCodes.language,
                currency: localeCodes.currency,
                country: localeCodes.country,
              },
            },
          });

          this.csrfService.sendCsrfTokenToClient(req, res);

          res.redirect(`${this.configService.get<string>('FRONTEND_URL')}`);
        }
      }
    }
  }

  /**
   * ! googleSigninCompleteRegistration
   */
  async googleSigninCompleteRegistration(
    body: GoogleSigninCompleteRegistrationBodyDto,
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const googleAuthProviderID =
      await this.prismaService.authStrategy.findFirst({
        where: {
          strategyName: 'google',
        },
      });

    const findUser = await this.prismaService.users.findFirst({
      where: {
        userSubID: parseInt(body.userSubID),
        email: body.email,
      },
      include: {
        authStrategyToUser: {
          include: {
            authStrategy: true,
          },
          where: {
            authStrategyID: googleAuthProviderID.id,
          },
        },
      },
    });

    if (!findUser || findUser.isUserRegistrationCompleted) {
      return next(
        new UnauthorizedException(
          this.translateService.translate({
            errorConstraints: ParseResponseMessage.parseObjToStr({
              translateFileName: 'googleAuthEndpoint',
              path: `GOOGLE_SIGNIN_COMPLETE_REGISTRATION.ACCOUNT_NOT_FOUND`,
            }),
          }),
        ),
      );
    }

    const updatedUser = await this.prismaService.users.update({
      where: {
        id: findUser.id,
      },
      data: {
        userBirthDay: new Date(
          `${body.userBirthDay.year}-${body.userBirthDay.month}-${body.userBirthDay.day}`,
        ),
        lastName: body.lastName,
        fullName: `${findUser.firstName} ${body.lastName}`,
        isUserActive: true,
        isUserRegistrationCompleted: true,
      },
      include: {
        authStrategyToUser: {
          include: {
            authStrategy: true,
          },
        },
        userPreference: {
          include: {
            language: true,
            currency: true,
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

    await this.prismaService.userPreference.create({
      data: {
        upSubID: Number(
          GeneratorManager.generateRandomId({
            length: 8,
            type: 'number',
          }),
        ),
        user: {
          connect: {
            id: updatedUser.id,
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

    SessionManager.setSession({
      req,
      sessionData: {
        ...updatedUser,
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
    });
  }
}
