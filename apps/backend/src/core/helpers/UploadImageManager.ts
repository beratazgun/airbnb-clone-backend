import * as multer from 'multer';
import { Request } from 'express';

export class UploadImageManager {
  static multerStorage(
    fileName: (req: Request, file: Express.Multer.File) => string,
    destination: string = process.env.UPLOAD_PATH,
  ) {
    return multer.diskStorage({
      destination: function (req, file, cb) {
        cb(null, destination);
      },
      filename: function (req, file, cb) {
        cb(null, fileName(req, file));
      },
    });
  }
}
