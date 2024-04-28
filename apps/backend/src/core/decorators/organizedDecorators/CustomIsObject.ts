import { IsObject } from 'class-validator';

import { ParseResponseMessage } from '@common/core/helpers/ParseResponseMessage';

export const CustomIsObject = () => {
  return (target: object, key: string) => {
    IsObject({
      each: true,
      message: ParseResponseMessage.parseObjToStr({
        translateFileName: 'validations',
        path: 'IS_OBJECT',
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
