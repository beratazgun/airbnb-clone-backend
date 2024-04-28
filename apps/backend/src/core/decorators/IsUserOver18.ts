import { registerDecorator, ValidationOptions } from 'class-validator';
import * as moment from 'moment';
import { ParseResponseMessage } from '@common/core/helpers/ParseResponseMessage';

export function IsUserOver18(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'IsUserOver18',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: {
        ...validationOptions,
        message: ParseResponseMessage.parseObjToStr({
          translateFileName: 'validations',
          path: 'IS_USER_OVER_18',
        }),
      },
      validator: {
        validate(value: { day: number; month: number; year: number }) {
          const userBirthDate = moment(
            `${value.year}-${value.month}-${value.day}`,
            'YYYY-MM-DD',
          );
          const now = moment();

          const age = now.diff(userBirthDate, 'years');

          return age >= 18;
        },
      },
    });
  };
}
