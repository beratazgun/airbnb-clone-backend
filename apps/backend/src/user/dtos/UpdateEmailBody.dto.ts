import {
  CustomIsEmail,
  CustomIsString,
} from '@backend/src/core/decorators/organizedDecorators';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateEmailBodyDto {
  @CustomIsEmail()
  @CustomIsString()
  @ApiProperty({
    description: 'The email of the user',
  })
  email: string;
}
