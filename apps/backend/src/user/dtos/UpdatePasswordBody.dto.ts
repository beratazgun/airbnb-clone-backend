import { IsCurrentAndNewPasswordEqual } from '@backend/src/core/decorators/IsCurrentAndNewPasswordEqual';
import { IsPasswordEqual } from '@backend/src/core/decorators/IsPasswordEqual';
import { IsPasswordStrong } from '@backend/src/core/decorators/IsPasswordStrong';
import { CustomIsString } from '@backend/src/core/decorators/organizedDecorators';
import { ApiProperty } from '@nestjs/swagger';
import { Length } from 'class-validator';

export class UpdatePasswordBodyDto {
  @CustomIsString()
  @Length(6, 30)
  @ApiProperty()
  currentPassword: string;

  @CustomIsString()
  @ApiProperty()
  @IsCurrentAndNewPasswordEqual('currentPassword')
  @IsPasswordStrong()
  newPassword: string;

  @CustomIsString()
  @ApiProperty()
  @IsPasswordEqual('newPassword')
  newPasswordConfirmation: string;
}
