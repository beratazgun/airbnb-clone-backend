import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import * as sharp from 'sharp';
import * as fs from 'fs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ImageSizeReducerPipe implements PipeTransform {
  constructor(private configService: ConfigService) {}

  async transform(file: Express.Multer.File[], metadata: ArgumentMetadata) {
    const imagesList: Express.Multer.File[] = Object.values(file).map(
      (image) => image[0],
    );

    for (const img of imagesList) {
      if (
        !this.isImage(img) ||
        !this.isImageFormatSupported(img) ||
        img.size > 1024 * 1024 * 50
      ) {
        fs.unlinkSync(img.path);
        imagesList.splice(imagesList.indexOf(img), 1);
      }

      switch (img.mimetype.split('/')[1]) {
        case 'png':
          this.editPngImage(img);
          break;
        case 'jpeg' || 'jpg':
          this.editJpgOrJpegImage(img);
          break;
      }
    }

    return imagesList;
  }

  protected async editPngImage(value: Express.Multer.File) {
    await sharp(value.path)
      .png({ quality: 50, compressionLevel: 8 })
      .toBuffer()
      .then((data) => {
        this.saveImage(value, data);
      });

    return value;
  }

  protected async editJpgOrJpegImage(value: Express.Multer.File) {
    await sharp(value.path)
      .jpeg({ quality: 50, progressive: true })
      .toBuffer()
      .then((data) => {
        this.saveImage(value, data);
      });

    return value;
  }

  protected isImage(img: Express.Multer.File) {
    const mimeType = img.mimetype.split('/')[0];
    return mimeType === 'image';
  }

  protected saveImage(img: Express.Multer.File, resizedImage: Buffer) {
    const filePath = `${this.configService.get<string>('UPLOAD_PATH')}/${
      img.originalname
    }`;

    if (img.size > resizedImage.buffer.byteLength) {
      fs.writeFileSync(filePath, resizedImage);
    }
  }

  protected isImageFormatSupported(img: Express.Multer.File) {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/jpg'];
    return allowedMimes.includes(img.mimetype);
  }
}
