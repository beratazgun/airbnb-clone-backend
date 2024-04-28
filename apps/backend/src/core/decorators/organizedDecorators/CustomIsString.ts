import { IsString } from 'class-validator';
import { ParseResponseMessage } from '@common/core/helpers/ParseResponseMessage';

export const CustomIsString = () => {
  return (target: object, key: string) => {
    IsString({
      message: ParseResponseMessage.parseObjToStr({
        translateFileName: 'validations',
        path: 'IS_STRING',
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
