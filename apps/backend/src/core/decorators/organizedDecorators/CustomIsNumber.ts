import { IsNumber } from 'class-validator';
import { ParseResponseMessage } from '@common/core/helpers/ParseResponseMessage';

export const CustomIsNumber = () => {
  return (target: object, key: string) => {
    IsNumber(
      {},
      {
        message: ParseResponseMessage.parseObjToStr({
          translateFileName: 'validations',
          path: 'IS_NUMBER',
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
