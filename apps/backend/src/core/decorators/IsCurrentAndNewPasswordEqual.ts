import { ParseResponseMessage } from '@common/core/helpers';
import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function IsCurrentAndNewPasswordEqual(
  property: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'IsCurrentAndNewPasswordEqual',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: {
        ...validationOptions,
        message: ParseResponseMessage.parseObjToStr({
          translateFileName: 'validations',
          path: 'CURRENT_AND_NEW_PASSWORD_DOESNT_EQUAL',
        }),
      },
      validator: {
        validate(value: string, args: ValidationArguments) {
          const propertyValue: string = args.object[property];
          const decoratorOwnerValue: string = value;

          return propertyValue !== decoratorOwnerValue;
        },
      },
    });
  };
}
