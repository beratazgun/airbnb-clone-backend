import { IsBoolean } from 'class-validator';
import { ParseResponseMessage } from '@common/core/helpers/ParseResponseMessage';

export const CustomIsBoolean = () => {
  return (target: object, key: string) => {
    IsBoolean({
      message: ParseResponseMessage.parseObjToStr({
        translateFileName: 'validations',
        path: 'IS_BOOLEAN',
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
