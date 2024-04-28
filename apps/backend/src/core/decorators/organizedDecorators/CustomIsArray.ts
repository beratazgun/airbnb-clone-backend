import { IsArray } from 'class-validator';
import { ParseResponseMessage } from '@common/core/helpers/ParseResponseMessage';

export const CustomIsArray = () => {
  return (target: object, key: string) => {
    IsArray({
      message: ParseResponseMessage.parseObjToStr({
        translateFileName: 'validations',
        path: 'IS_ARRAY',
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
