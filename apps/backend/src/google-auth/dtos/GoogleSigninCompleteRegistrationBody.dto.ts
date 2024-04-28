import { UserBirthDay } from '@backend/src/auth/dtos';
import { IsUserOver18 } from '@backend/src/core/decorators/IsUserOver18';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import {
  CustomIsNotEmpty,
  CustomIsString,
  CustomIsObject,
} from '@backend/src/core/decorators/organizedDecorators';
import { ApiProperty } from '@nestjs/swagger';

export class GoogleSigninCompleteRegistrationBodyDto {
  @IsUserOver18()
  @CustomIsObject()
  @CustomIsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => UserBirthDay)
  @ApiProperty({ type: UserBirthDay })
  userBirthDay: UserBirthDay;

  @CustomIsNotEmpty()
  @CustomIsString()
  @ApiProperty()
  email: string;

  @CustomIsString()
  @CustomIsNotEmpty()
  @ApiProperty()
  lastName: string;

  @CustomIsNotEmpty()
  @CustomIsString()
  @ApiProperty()
  userSubID: string;
}
