import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { S3Service } from '../common/aws/s3.service';
import { MESSAGES } from './constants/upload.constant';

@Injectable()
export class UploadsService {
  constructor(private readonly s3Service: S3Service) { }

  /**
   * Upload a file to S3
   */
  async uploadFile(file: Express.Multer.File) {
    try {
      if (!file) {
        throw new HttpException(MESSAGES.FILE_UPLOAD.NO_FILE, HttpStatus.BAD_REQUEST);
      }

      // Use the existing S3Service which already handles validation and upload
      const uploadResult = await this.s3Service.uploadFile(file);

      return {
        key: uploadResult.key
      };

    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        MESSAGES.FILE_UPLOAD.UNEXPECTED_ERROR,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
