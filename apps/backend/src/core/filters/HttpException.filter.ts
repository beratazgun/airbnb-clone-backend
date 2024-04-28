import { TranslateService } from '@common';
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Injectable,
} from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { Response } from 'express';

@Catch(HttpException)
@Injectable()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private translateService: TranslateService) {}

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const responseException = exception.getResponse();

    if (responseException['message'][0] instanceof ValidationError) {
      return this.transformValidationErrors(
        responseException,
        response,
        status,
      );
    } else {
      response.status(status).json({
        isSuccess: false,
        statusCode: status,
        message: responseException['message'],
        status: responseException['error'],
      });
    }
  }

  private transformValidationErrors(
    responseException: string | object,
    response: Response,
    status: number,
  ) {
    const validationErrors: any = {};

    responseException['message'].map((error: ValidationError) => {
      if (error.children.length > 0) {
        validationErrors[error.property] = {
          ...error.children.reduce((acc, childError: ValidationError) => {
            return {
              ...acc,
              [childError.property]: this.translateService.translate({
                errorConstraints: Object.values(childError.constraints)[0],
              }),
            };
          }, {}),
        };
      } else {
        validationErrors[error.property] = this.translateService.translate({
          errorConstraints: Object.values(error.constraints)[0],
        });
      }
    });

    return response.status(status).json({
      isSuccess: false,
      statusCode: status,
      message: 'Validation failed',
      validationErrors,
      status: responseException['error'],
      stack: responseException,
    });
  }
}
