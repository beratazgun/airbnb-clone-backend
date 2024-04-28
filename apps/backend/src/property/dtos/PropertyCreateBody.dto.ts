import {
  CustomIsArray,
  CustomIsBoolean,
  CustomIsNotEmpty,
  CustomIsNumber,
  CustomIsObject,
  CustomIsString,
} from '@backend/src/core/decorators/organizedDecorators';
import { ParseResponseMessage } from '@common/core/helpers';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, ValidateIf, ValidateNested } from 'class-validator';

class PropertyLocationDto {
  @CustomIsNumber()
  @CustomIsNotEmpty()
  @ApiProperty()
  latitude: number;

  @CustomIsNumber()
  @CustomIsNotEmpty()
  @ApiProperty()
  longitude: number;

  @CustomIsNotEmpty()
  @CustomIsString()
  @ApiProperty()
  district: string;

  @CustomIsString()
  @CustomIsNotEmpty()
  @ApiProperty()
  addressLineOne: string;

  @CustomIsString()
  @ApiProperty()
  @ValidateIf((o) => o.addressLineTwo)
  addressLineTwo?: string;

  @CustomIsString()
  @ApiProperty()
  @ValidateIf((o) => o.addressLineTwo)
  addressLineThree?: string;

  @CustomIsString()
  @ApiProperty()
  @ValidateIf((o) => o.addressLineTwo)
  addressLineFour?: string;

  @CustomIsString()
  @ApiProperty()
  street: string;

  @CustomIsString()
  @ApiProperty()
  apartmentBuildingFloor: string;

  @CustomIsBoolean()
  @ApiProperty()
  showClearLocation: boolean;

  @CustomIsString()
  @CustomIsNotEmpty()
  @ApiProperty()
  zipCode: string;
}

export class PropertyCreateBodyDto {
  @CustomIsString()
  @CustomIsNotEmpty()
  @ApiProperty()
  @IsIn(
    [
      'PROPERTY_TYPE',
      'PLACE_TYPE',
      'PROPERTY_LOCATION',
      'FLOOR_PLAN',
      'OPPORTUNITY',
      'PROPERTY_IMAGES',
      'PROPERTY_TITLE',
      'PROPERTY_DESCRIPTION',
      'NIGHTLY_PRICE',
      'LAST_STEP',
      'COMPLETE',
    ],
    {
      message: ParseResponseMessage.parseObjToStr({
        translateFileName: 'validations',
        path: 'IS_IN',
        args: {
          otherArgs: {
            FIELD_NAME: 'stageType',
            ALLOWED_VALUES: [
              'PROPERTY_TYPE',
              'PLACE_TYPE',
              'PROPERTY_LOCATION',
              'FLOOR_PLAN',
              'OPPORTUNITY',
              'PROPERTY_IMAGES',
              'PROPERTY_TITLE',
              'PROPERTY_DESCRIPTION',
              'NIGHTLY_PRICE',
              'LAST_STEP',
              'COMPLETE',
            ],
          },
        },
      }),
      each: true,
    },
  )
  stageType: string;

  @CustomIsNumber()
  @CustomIsNotEmpty()
  @ApiProperty()
  propertySubID: number;

  @CustomIsString()
  @CustomIsNotEmpty()
  @ApiProperty({
    default: 'house',
  })
  @ValidateIf((object) => object.stageType === 'PROPERTY_TYPE')
  propertyType: string;

  @CustomIsString()
  @CustomIsNotEmpty()
  @ApiProperty({
    default: 'room',
  })
  @ValidateIf((object) => object.stageType === 'PLACE_TYPE')
  placeType: string;

  @CustomIsObject()
  @CustomIsNotEmpty()
  @ApiProperty()
  @ValidateNested()
  @Type(() => PropertyLocationDto)
  @ValidateIf((object) => object.stageType === 'PROPERTY_LOCATION')
  location: PropertyLocationDto;

  @CustomIsNumber()
  @CustomIsNotEmpty()
  @ApiProperty()
  @ValidateIf((object) => object.stageType === 'FLOOR_PLAN')
  numberOfBedrooms: number;

  @CustomIsNumber()
  @CustomIsNotEmpty()
  @ApiProperty()
  @ValidateIf((object) => object.stageType === 'FLOOR_PLAN')
  numberOfBaths: number;

  @CustomIsNumber()
  @CustomIsNotEmpty()
  @ApiProperty()
  @ValidateIf((object) => object.stageType === 'FLOOR_PLAN')
  numberOfGuests: number;

  @CustomIsNumber()
  @CustomIsNotEmpty()
  @ApiProperty()
  @ValidateIf((object) => object.stageType === 'FLOOR_PLAN')
  numberOfBeds: number;

  @CustomIsArray()
  @CustomIsNotEmpty()
  @ApiProperty()
  @ValidateIf((object) => object.stageType === 'OPPORTUNITY')
  opportunity: string[];

  @CustomIsArray()
  @CustomIsNotEmpty()
  @ApiProperty()
  @ValidateIf((object) => object.stageType === 'PROPERTY_IMAGES')
  images: string[];

  @CustomIsString()
  @CustomIsNotEmpty()
  @ApiProperty({
    default: "My house's title.",
  })
  @ValidateIf((object) => object.stageType === 'PROPERTY_TITLE')
  title: string;

  @CustomIsString()
  @CustomIsNotEmpty()
  @ApiProperty({
    default: 'My house is very comfortable and has a great view.',
  })
  @ValidateIf((object) => object.stageType === 'PROPERTY_DESCRIPTION')
  description: string;

  @CustomIsNumber()
  @CustomIsNotEmpty()
  @ApiProperty()
  @ValidateIf((object) => object.stageType === 'NIGHTLY_PRICE')
  nightlyPrice: number;

  @CustomIsBoolean()
  @CustomIsNotEmpty()
  @ApiProperty()
  @ValidateIf((object) => object.stageType === 'LAST_STEP')
  isThereWeapons: boolean;

  @CustomIsBoolean()
  @CustomIsNotEmpty()
  @ApiProperty()
  @ValidateIf((object) => object.stageType === 'LAST_STEP')
  isThereDangerousAnimals: boolean;

  @CustomIsBoolean()
  @CustomIsNotEmpty()
  @ApiProperty()
  @ValidateIf((object) => object.stageType === 'LAST_STEP')
  isThereSecurityCameras: boolean;
}
