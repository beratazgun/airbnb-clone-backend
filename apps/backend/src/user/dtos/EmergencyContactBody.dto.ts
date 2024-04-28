import {
  CustomIsEmail,
  CustomIsNotEmpty,
  CustomIsNumber,
  CustomIsPhoneNumber,
  CustomIsString,
} from '@backend/src/core/decorators/organizedDecorators';
import { ApiProperty } from '@nestjs/swagger';

export class EmergencyContactBodyDto {
  @CustomIsString()
  @CustomIsNotEmpty()
  @ApiProperty({
    example: 'John',
    description: 'The first name of the emergency contact',
  })
  firstName: string;

  @CustomIsString()
  @CustomIsNotEmpty()
  @ApiProperty({
    example: 'Doe',
    description: 'The last name of the emergency contact',
  })
  lastName: string;

  @CustomIsString()
  @CustomIsNotEmpty()
  @ApiProperty({
    example: 'Father',
    description: 'The relationship of the emergency contact to the user',
  })
  relationship: string;

  @CustomIsString()
  @CustomIsNotEmpty()
  @ApiProperty({
    example: 'en',
    description: 'The preferred language of the emergency contact',
  })
  preferedLang: string;

  @CustomIsString()
  @CustomIsNotEmpty()
  @CustomIsEmail()
  @ApiProperty({
    example: 'johndoe@example.com',
    description: 'The email of the emergency contact',
  })
  email: string;

  @CustomIsNotEmpty()
  @CustomIsString()
  @ApiProperty({
    example: '+1234567890',
    description: 'The phone number of the emergency contact',
  })
  phone: string;
}
