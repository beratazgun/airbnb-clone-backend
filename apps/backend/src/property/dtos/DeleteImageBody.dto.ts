import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty } from 'class-validator';

export class DeleteImageBodyDto {
  @IsArray()
  @IsNotEmpty()
  @ApiProperty({
    type: 'array',
    description: 'Array of image urls to delete',
    example: [
      'https://example.com/image.jpg',
      'https://example.com/image2.jpg',
    ],
  })
  imageUrls: string[];
}
