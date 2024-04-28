import { IsNumberInRange } from '@backend/src/core/decorators/IsNumberInRange';
import { IsPasswordEqual } from '@backend/src/core/decorators/IsPasswordEqual';
import { IsPasswordStrong } from '@backend/src/core/decorators/IsPasswordStrong';
import { IsUserOver18 } from '@backend/src/core/decorators/IsUserOver18';
import {
  CustomIsString,
  CustomIsNotEmpty,
  CustomIsNumber,
  CustomIsEmail,
  CustomIsObject,
} from '@backend/src/core/decorators/organizedDecorators';
import { ParseResponseMessage } from '@common/core/helpers/ParseResponseMessage';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';

export class UserBirthDay {
  @CustomIsNumber()
  @ApiProperty()
  @IsNumberInRange(1, 31, {
    message(validationArguments) {
      const [min, max] = validationArguments.constraints;
      return ParseResponseMessage.parseObjToStr({
        translateFileName: 'validations',
        path: 'USER_BIRTH_DAY.DAY',
        args: {
          otherArgs: {
            MIN: min,
            MAX: max,
          },
        },
      });
    },
  })
  day: number;

  @CustomIsNumber()
  @ApiProperty()
  @IsNumberInRange(1, 12, {
    message(validationArguments) {
      const [min, max] = validationArguments.constraints;
      return ParseResponseMessage.parseObjToStr({
        translateFileName: 'validations',
        path: 'USER_BIRTH_DAY.MONTH',
        args: {
          otherArgs: {
            MIN: min,
            MAX: max,
          },
        },
      });
    },
  })
  month: number;

  @CustomIsNumber()
  @ApiProperty()
  @IsNumberInRange(1900, new Date().getFullYear(), {
    message(validationArguments) {
      const [min, max] = validationArguments.constraints;
      return ParseResponseMessage.parseObjToStr({
        translateFileName: 'validations',
        path: 'USER_BIRTH_DAY.YEAR',
        args: {
          otherArgs: {
            MIN: min,
            MAX: max,
          },
        },
      });
    },
  })
  year: number;
}

export class SignupForWebBodyDto {
  @CustomIsString()
  @CustomIsNotEmpty()
  @ApiProperty()
  firstName: string;

  @CustomIsString()
  @CustomIsNotEmpty()
  @ApiProperty()
  lastName: string;

  @ApiProperty()
  @CustomIsObject()
  @CustomIsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => UserBirthDay)
  @IsUserOver18()
  userBirthDay: UserBirthDay;

  @CustomIsString()
  @ApiProperty()
  @CustomIsNotEmpty()
  @IsPasswordStrong()
  password: string;

  @CustomIsString()
  @ApiProperty()
  @CustomIsNotEmpty()
  @IsPasswordEqual('password')
  passwordConfirmation: string;

  @CustomIsString()
  @CustomIsNotEmpty()
  @ApiProperty()
  @CustomIsEmail()
  email: string;
}
