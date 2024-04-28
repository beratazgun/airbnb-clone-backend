import { IsEmail } from 'class-validator';
import { ParseResponseMessage } from '@common/core/helpers/ParseResponseMessage';

export const CustomIsEmail = () => {
  return (target: object, key: string) => {
    IsEmail(
      {},
      {
        message: ParseResponseMessage.parseObjToStr({
          translateFileName: 'validations',
          path: 'INVALID_EMAIL',
          args: {
            translatable: {
              fields: {
                FIELD_NAME: key,
              },
            },
          },
        }),
      },
    )(target, key);
  };
};
