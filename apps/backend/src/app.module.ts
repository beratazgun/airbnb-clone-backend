import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { APP_FILTER } from '@nestjs/core';
import { PrismaClientValidationErrorFilter } from './core/filters/PrismaClientValidationError.filter';
import { PrismaClientKnownRequestErrorFilter } from './core/filters/PrismaClientKnownRequestError.filter';
import { UserModule } from './user/user.module';
import * as Joi from 'joi';
import { GoogleAuthModule } from './google-auth/google-auth.module';
import { CheckQueryParamsMiddleware } from './core/middlewares/CheckQueryParams.middleware';
import { join } from 'path';
import { AuthController } from './auth/auth.controller';
import { GoogleAuthController } from './google-auth/google-auth.controller';
import { UserController } from './user/user.controller';
import { HttpExceptionFilter } from './core/filters/HttpException.filter';
import { TranslateModule } from '@common';
import { SharedModule } from './shared/shared.module';
import { GlobalModule } from './global/global.module';
import { PropertyModule } from './property/property.module';
import { PropertyController } from './property/property.controller';
import { BookingModule } from './booking/booking.module';
import { BookingController } from './booking/booking.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `${
        process.env.NODE_ENV === 'development'
          ? './apps/airbnb-backend/src/core/config/.env.development'
          : './apps/airbnb-backend/src/core/config/.env.production'
      }`,
      isGlobal: true,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test')
          .default('development'),
      }),
    }),
    TranslateModule.forRoot(join(__dirname, '/i18n/')),
    // MongooseModule.forRoot(
    //   process.env.NODE_ENV === 'development'
    //     ? `mongodb://mongodb` // for docker
    //     : `mongodb://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_HOST}:${process.env.MONGO_PORT}`,
    //   {
    //     dbName: 'airbnb-clone-mongodb',
    //   },
    // ),
    AuthModule,
    UserModule,
    GoogleAuthModule,
    SharedModule,
    GlobalModule,
    PropertyModule,
    BookingModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: PrismaClientKnownRequestErrorFilter,
    },
    {
      provide: APP_FILTER,
      useClass: PrismaClientValidationErrorFilter,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CheckQueryParamsMiddleware)
      .exclude({
        path: 'google-auth/(.*)',
        method: RequestMethod.GET,
      })
      .forRoutes(
        AuthController,
        GoogleAuthController,
        UserController,
        PropertyController,
        BookingController,
      );
  }
}
