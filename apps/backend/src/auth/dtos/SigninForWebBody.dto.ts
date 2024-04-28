import {
  CustomIsString,
  CustomIsEmail,
  CustomIsNotEmpty,
} from '@backend/src/core/decorators/organizedDecorators';
import { ApiProperty } from '@nestjs/swagger';

export class SigninForWebBodyDto {
  @ApiProperty({
    description: 'User email',
    example: 'test@gmail.com',
  })
  @CustomIsString()
  @CustomIsEmail()
  email: string;

  @CustomIsString()
  @CustomIsNotEmpty()
  @ApiProperty({
    description: 'User password',
    example: '135792Tt!_',
  })
  password: string;
}
