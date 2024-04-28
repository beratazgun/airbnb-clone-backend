import { IsNotEmpty } from 'class-validator';

import { ParseResponseMessage } from '@common/core/helpers/ParseResponseMessage';

export const CustomIsNotEmpty = () => {
  return (target: object, key: string) => {
    IsNotEmpty({
      message: ParseResponseMessage.parseObjToStr({
        translateFileName: 'validations',
        path: 'NOT_EMPTY',
        args: {
          translatable: {
            fields: {
              FIELD_NAME: key,
            },
          },
        },
      }),
    })(target, key);
  };
};
