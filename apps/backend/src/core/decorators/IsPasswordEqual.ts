import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';
import { ParseResponseMessage } from '@common/core/helpers/ParseResponseMessage';

export function IsPasswordEqual(
  property: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'IsPasswordEqual',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: {
        ...validationOptions,
        message: ParseResponseMessage.parseObjToStr({
          translateFileName: 'validations',
          path: 'PASSWORDS_DO_NOT_MATCH',
        }),
      },
      validator: {
        validate(value: string, args: ValidationArguments) {
          const propertyValue: string = args.object[property];
          const decoratorOwnerValue: string = value;

          return propertyValue === decoratorOwnerValue;
        },
      },
    });
  };
}
