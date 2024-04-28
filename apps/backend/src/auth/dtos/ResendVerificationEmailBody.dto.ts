import {
  CustomIsEmail,
  CustomIsNotEmpty,
  CustomIsString,
} from '@backend/src/core/decorators/organizedDecorators';
import { ApiProperty } from '@nestjs/swagger';

export class ResendVerificationEmailBodyDto {
  @CustomIsEmail()
  @CustomIsNotEmpty()
  @CustomIsString()
  @ApiProperty({
    type: String,
    example: 'example@gmail.com',
    description: 'The user email',
  })
  email: string;
}
