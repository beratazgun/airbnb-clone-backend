import {
  Body,
  Controller,
  Next,
  Post,
  Query,
  Req,
  Res,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { PropertyService } from './property.service';
import { AuthorizationGuard } from '../core/guards/Authorization.guard';
import { NextFunction, Request, Response } from 'express';
import { DeleteImageBodyDto, PropertyCreateBodyDto } from './dtos';
import { ApiProperty, ApiTags } from '@nestjs/swagger';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import imageUploadFields from '../core/helpers/imageUploadFields';
import { UploadImageManager } from '../core/helpers/UploadImageManager';
import { ImageSizeReducerPipe } from '../core/pipes/ImageSizeReducer.pipe';

@ApiTags('property')
@Controller('property')
export class PropertyController {
  constructor(private readonly propertyService: PropertyService) {}

  /**
   * !newProperty
   */
  @Post('new-property')
  @ApiProperty({
    type: 'object',
    description:
      'This will create a new property and return the some credentials.',
  })
  @UseGuards(AuthorizationGuard)
  newProperty(
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: NextFunction,
  ): Promise<void> {
    return this.propertyService.newProperty(req, res);
  }

  /**
   * !  createProperty
   */
  @Post('create')
  @UseGuards(AuthorizationGuard)
  async createProperty(
    @Body() body: PropertyCreateBodyDto,
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: NextFunction,
  ) {
    return this.propertyService.createProperty(body, req, res, next);
  }

  /**
   * !uploadImageForProperty
   */
  @Post('upload-image')
  @UseGuards(AuthorizationGuard)
  @UseInterceptors(
    FileFieldsInterceptor(imageUploadFields(), {
      storage: UploadImageManager.multerStorage(
        (req: Request, file: Express.Multer.File) => {
          return `${file.originalname}`;
        },
      ),
    }),
  )
  @ApiProperty({
    type: 'file',
    name: 'file',
    description: 'Image file. Only image files are allowed.',
  })
  uploadImageForProperty(
    @UploadedFiles(ImageSizeReducerPipe) file: Express.Multer.File[],
    @Res() res: Response,
    @Next() next: NextFunction,
  ) {
    return this.propertyService.uploadImageForProperty(file, res, next);
  }

  /**
   * !deleteImageForProperty
   */
  @Post('delete-image')
  @UseGuards(AuthorizationGuard)
  deleteImageForProperty(
    @Body() body: DeleteImageBodyDto,
    @Res() res: Response,
    @Next() next: NextFunction,
  ) {
    return this.propertyService.DeleteImageForProperty(body, res, next);
  }
}
