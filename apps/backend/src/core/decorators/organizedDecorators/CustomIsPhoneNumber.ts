import { IsPhoneNumber } from 'class-validator';
import { ParseResponseMessage } from '@common/core/helpers/ParseResponseMessage';

export const CustomIsPhoneNumber = () => {
  return (target: object, key: string) => {
    // I will fix this later
    IsPhoneNumber('TR', {
      message: ParseResponseMessage.parseObjToStr({
        translateFileName: 'validations',
        path: 'INVALID_PHONE_NUMBER',
      }),
    })(target, key);
  };
};
