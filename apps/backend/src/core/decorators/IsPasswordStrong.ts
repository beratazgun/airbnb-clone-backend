import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';
import { zxcvbnAsync, zxcvbnOptions } from '@zxcvbn-ts/core';
import * as zxcvbnCommonPackage from '@zxcvbn-ts/language-common';
import * as zxcvbnEnPackage from '@zxcvbn-ts/language-en';
import { ParseResponseMessage } from '@common/core/helpers/ParseResponseMessage';

export function IsPasswordStrong(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'IsPasswordStrong',
      target: object.constructor,
      propertyName,
      constraints: [
        {
          message: (constraints: ValidationArguments['constraints']) => {
            return constraints;
          },
        },
      ],
      options: {
        message: (validationArguments) => {
          const [warning] = validationArguments.constraints;

          return ParseResponseMessage.parseObjToStr({
            translateFileName: 'validations',
            path: `${warning}`,
          });
        },
        ...validationOptions,
      },
      validator: {
        async validate(value: string, args: ValidationArguments) {
          if (!value) {
            return false;
          }

          zxcvbnOptions.setOptions({
            translations: zxcvbnEnPackage.translations,
            graphs: zxcvbnCommonPackage.adjacencyGraphs,
            dictionary: {
              ...zxcvbnCommonPackage.dictionary,
              ...zxcvbnEnPackage.dictionary,
            },
          });

          const { score } = await zxcvbnAsync(value);

          if (score < 3) {
            switch (score) {
              case 0:
                args.constraints[0] = 'IS_PASSWORD_SECURE.VERY_WEAK';
                break;
              default:
                args.constraints[0] = 'IS_PASSWORD_SECURE.WEAK';
                break;
            }

            return false;
          } else {
            return true;
          }
        },
      },
    });
  };
}
