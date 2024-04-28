import {
  CustomIsEmail,
  CustomIsString,
  CustomIsNotEmpty,
} from '@backend/src/core/decorators/organizedDecorators';
import { ApiProperty } from '@nestjs/swagger';

export class AuthFlowBodyDto {
  @CustomIsString()
  @CustomIsEmail()
  @CustomIsNotEmpty()
  @ApiProperty({
    type: String,
    description: 'The email of the user',
    example: 'example@gmail.com',
  })
  email: string;
}
