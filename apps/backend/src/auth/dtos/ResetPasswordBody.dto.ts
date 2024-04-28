import { IsPasswordEqual } from '@backend/src/core/decorators/IsPasswordEqual';
import { IsPasswordStrong } from '@backend/src/core/decorators/IsPasswordStrong';
import {
  CustomIsNotEmpty,
  CustomIsString,
} from '@backend/src/core/decorators/organizedDecorators';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordBodyDto {
  @CustomIsNotEmpty()
  @CustomIsString()
  @IsPasswordStrong()
  @ApiProperty({
    example: 'password',
    description: 'The new password',
  })
  newPassword: string;

  @CustomIsNotEmpty()
  @CustomIsString()
  @IsPasswordEqual('newPassword')
  @ApiProperty({
    example: 'password',
    description: 'The new password confirmation',
  })
  newPasswordConfirmation: string;
}
