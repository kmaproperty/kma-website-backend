import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { S3Service } from '../common/aws/s3.service';
import { GeneratePresignedUrlDto, PresignedUrlResponseDto } from './dto/generate-presigned-url.dto';
import * as crypto from 'crypto';
import * as path from 'path';

@Injectable()
export class UploadsService {
  constructor(private readonly s3Service: S3Service) {}

  /**
   * Generate a presigned URL for uploading files to S3
   */
  async generatePresignedUrl(dto: GeneratePresignedUrlDto): Promise<PresignedUrlResponseDto> {
    try {
      // Generate unique filename
      const fileExtension = path.extname(dto.filename);
      const timestamp = Date.now();
      const randomString = crypto.randomBytes(8).toString('hex');
      const sanitizedFilename = path.basename(dto.filename, fileExtension);
      const uniqueFilename = `${timestamp}-${randomString}${fileExtension}`;

      // Create S3 key with folder structure
      const folder = dto.folder || 'uploads';
      const key = `${folder}/${uniqueFilename}`;

      // Generate presigned URL
      const expiresIn = dto.expiresIn || 3600;
      const url = await this.s3Service.generatePresignedUploadUrl(
        key,
        dto.contentType,
        expiresIn,
      );

      return {
        url,
        key,
        expiresIn,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to generate presigned URL',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
