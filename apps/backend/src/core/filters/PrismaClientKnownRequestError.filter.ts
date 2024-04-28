import {
  ArgumentsHost,
  Catch,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { Response } from 'express';
import { ParseResponseMessage } from '@common/core/helpers';
import { TranslateService } from '@common';

interface ErrorMapping {
  description?: string;
  status: string;
  statusCode?: number;
  prismaErrorCode?: string;
}

export const errorMappings: Record<string, ErrorMapping> = {
  P2000: {
    description:
      "The provided value for the column is too long for the column's type. Column: {column_name}",
    statusCode: HttpStatus.BAD_REQUEST,
    status: 'Bad Request',
    prismaErrorCode: 'P2000',
  },
  P2002: {
    description: 'Unique constraint failed on the {constraint}',
    statusCode: HttpStatus.CONFLICT,
    status: 'Conflict',
    prismaErrorCode: 'P2002',
  },
  P2003: {
    description: 'Foreign key constraint failed on the field: {field_name}',
    statusCode: HttpStatus.BAD_REQUEST,
    status: 'bad Request',
    prismaErrorCode: 'P2003',
  },
  P2025: {
    description:
      'An operation failed because it depends on one or more records that were required but not found. {cause}',
    statusCode: HttpStatus.BAD_REQUEST,
    status: 'bad Request',
    prismaErrorCode: 'P2025',
  },
  P2014: {
    description:
      "The change you are trying to make would violate the required relation '{relation_name}' between the {model_a_name} and {model_b_name} models.",
    statusCode: HttpStatus.BAD_REQUEST,
    status: 'Bad Request',
    prismaErrorCode: 'P2014',
  },
};

@Catch(PrismaClientKnownRequestError)
export class PrismaClientKnownRequestErrorFilter extends BaseExceptionFilter {
  constructor(private translateService: TranslateService) {
    super();
  }

  catch(exception: PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    console.log('***********');
    console.log('***********');
    console.log('***********');
    console.log(exception.message);
    console.log('-----');
    console.log(exception.code);
    console.log('-----');
    console.log(exception.meta);
    console.log('-----');
    console.log(exception.name);
    console.log('***********');
    console.log('***********');
    console.log('***********');

    const errorMapping = errorMappings[exception.code];

    if (errorMapping) {
      const { statusCode, status } = errorMapping;

      if (statusCode === HttpStatus.CONFLICT) {
        response.status(statusCode).json({
          statusCode,
          isSuccess: false,
          status,
          message: 'Validation failed',
          validationErrors: {
            [exception.meta.target[0]]: this.translateService.translate({
              errorConstraints: this.errorMatcher(errorMapping, exception),
            }),
          },
        });
      } else {
        response.status(statusCode).json({
          statusCode,
          isSuccess: false,
          status,
          message: this.errorMatcher(errorMapping, exception),
        });
      }
    } else {
      response.status(500).json({
        isSuccess: false,
        message: 'Something went wrong',
      });
      // exception instanceof HttpException
      //   ? exception.getStatus()
      //   : HttpStatus.INTERNAL_SERVER_ERROR;
      // super.catch(exception, host);
    }
  }

  errorMatcher(
    errorMapping: ErrorMapping,
    exception: PrismaClientKnownRequestError,
  ): string {
    const { prismaErrorCode } = errorMapping;

    switch (prismaErrorCode) {
      case 'P2000':
        // return `${exception.meta.target[0]} is invalid.`;
        return ParseResponseMessage.parseObjToStr({
          translateFileName: 'prismaErrors',
          path: 'PRISMA_CLIENT_KNOWN_ERRORS.P2000',
          args: {
            translatable: {
              fields: {
                COLUMN_NAME: exception.meta.target[0],
              },
            },
          },
        });
      case 'P2002':
        // return `${exception.meta.target[0]} already exists.`;
        return ParseResponseMessage.parseObjToStr({
          translateFileName: 'prismaErrors',
          path: 'PRISMA_CLIENT_KNOWN_ERRORS.P2002',
          args: {
            translatable: {
              fields: {
                FIELD_NAME: exception.meta.target[0],
              },
            },
          },
        });
      case 'P2003':
        // return `Foreign key constraint failed on the field: ${
        //   exception.meta.field_name.toString().split('_')[1]
        // }`;
        return ParseResponseMessage.parseObjToStr({
          translateFileName: 'prismaErrors',
          path: 'PRISMA_CLIENT_KNOWN_ERRORS.P2003',
          args: {
            translatable: {
              fields: {
                FIELD_NAME: exception.meta.field_name.toString().split('_')[1],
              },
            },
          },
        });
      case 'P2025':
        // return `${exception.meta.cause}`;
        return ParseResponseMessage.parseObjToStr({
          translateFileName: 'prismaErrors',
          path: 'PRISMA_CLIENT_KNOWN_ERRORS.P2025',
          args: {
            translatable: {
              fields: {
                FIELD_VALUE: exception.meta,
                FIELD_NAME: exception.meta.field_name,
              },
            },
          },
        });
      default:
        return 'Something went wrong.';
    }
  }
}
