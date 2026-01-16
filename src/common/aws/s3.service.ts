import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import * as crypto from 'crypto';
import * as path from 'path';

export interface UploadResult {
  key: string;
  url: string;
}

@Injectable()
export class S3Service {
  private readonly logger = new Logger(S3Service.name);
  private s3Client: S3Client;
  private bucketName: string;
  private region: string;
  private cloudFrontDomain?: string;

  constructor(private configService: ConfigService) {
    this.validateEnvironmentVariables();
    this.bucketName = this.configService.get<string>(
      'AWS_BUCKET',
      'project-dev-files',
    );
    this.region = this.configService.get<string>('AWS_REGION', 'us-east-1');
    this.cloudFrontDomain = this.configService.get<string>(
      'AWS_BUCKET_CLOUDFRONT_URL',
    );

    if (!this.bucketName) {
      throw new InternalServerErrorException(
        'AWS_BUCKET environment variable is required',
      );
    }

    this.s3Client = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY', ''),
        secretAccessKey: this.configService.get<string>('AWS_SECRET_KEY', ''),
      },
    });
  }

  /**
   * Validate required environment variables
   */
  private validateEnvironmentVariables(): void {
    const requiredEnvVars = ['AWS_REGION', 'AWS_ACCESS_KEY', 'AWS_SECRET_KEY'];
    const missingVars = requiredEnvVars.filter(
      (varName) => !process.env[varName],
    );

    if (missingVars.length > 0) {
      throw new InternalServerErrorException(
        `Missing required AWS environment variables: ${missingVars.join(', ')}`,
      );
    }
  }

  async uploadFile(
    file: Express.Multer.File,
    folder: string = 'uploads',
    userId?: string,
  ): Promise<UploadResult> {
    try {
      // Validate file
      this.validateFile(file);

      // Generate unique filename
      const fileExtension = path.extname(file.originalname);
      const timestamp = Date.now();
      const randomString = crypto.randomBytes(8).toString('hex');
      const filename = `${timestamp}-${randomString}${fileExtension}`;

      // Create S3 key with folder structure
      const key = userId
        ? `${folder}/${userId}/${filename}`
        : `${folder}/${filename}`;

      // Upload to S3
      const uploadCommand = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        CacheControl: 'max-age=31536000', // 1 year
        Metadata: {
          originalName: file.originalname,
          uploadedAt: new Date().toISOString(),
          userId: userId || 'anonymous',
        },
      });

      await this.s3Client.send(uploadCommand);

      // Generate URL
      const url = this.generateFileUrl(key);

      return {
        key,
        url,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `S3 upload error: ${errorMessage}`,
        error instanceof Error ? error.stack : '',
      );
      throw new InternalServerErrorException(
        `Failed to upload file: ${errorMessage}`,
      );
    }
  }

  async deleteFile(key: string): Promise<boolean> {
    try {
      const deleteCommand = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3Client.send(deleteCommand);
      return true;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `S3 delete error: ${errorMessage}`,
        error instanceof Error ? error.stack : '',
      );
      return false;
    }
  }

  async fileExists(key: string): Promise<boolean> {
    try {
      const headCommand = new HeadObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3Client.send(headCommand);
      return true;
    } catch (error) {
      return false;
    }
  }

  async generatePresignedUrl(
    key: string,
    expiresIn: number = 7200,
  ): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      return await getSignedUrl(this.s3Client, command, { expiresIn });
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to generate presigned URL: ${error.message}`,
      );
    }
  }

  async generatePresignedUploadUrl(
    key: string,
    contentType: string,
    expiresIn: number = 3600,
  ): Promise<string> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        ContentType: contentType,
        CacheControl: 'max-age=31536000',
      });

      return await getSignedUrl(this.s3Client, command, { expiresIn });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Failed to generate presigned upload URL: ${errorMessage}`,
        error instanceof Error ? error.stack : '',
      );
      throw new InternalServerErrorException(
        `Failed to generate presigned upload URL: ${errorMessage}`,
      );
    }
  }

  private validateFile(file: Express.Multer.File): void {
    // Check file size (20MB limit)
    const maxSize = 20 * 1024 * 1024; // 20MB
    if (file.size > maxSize) {
      throw new BadRequestException(
        'File size too large. Maximum size is 20MB',
      );
    }

    // Check file type for images and videos
    const allowedMimeTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
      'video/mp4',
      'video/quicktime',
      'video/x-msvideo',
      'video/x-matroska',
      'video/webm',
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Only JPEG, PNG, GIF, WebP, SVG images and MP4, MOV, AVI, MKV, WebM videos are allowed',
      );
    }

    // Check file extension
    const allowedExtensions = [
      '.jpg',
      '.jpeg',
      '.png',
      '.gif',
      '.webp',
      '.svg',
      '.mp4',
      '.mov',
      '.avi',
      '.mkv',
      '.webm',
    ];
    const fileExtension = path.extname(file.originalname).toLowerCase();

    if (!allowedExtensions.includes(fileExtension)) {
      throw new BadRequestException('Invalid file extension');
    }
  }

  private generateFileUrl(key: string): string {
    if (this.cloudFrontDomain) {
      return `${this.cloudFrontDomain}/${key}`;
    }

    return `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${key}`;
  }

  extractKeyFromUrl(url: string): string | null {
    try {
      // For CloudFront URLs
      if (this.cloudFrontDomain && url.startsWith(this.cloudFrontDomain)) {
        return url.replace(`${this.cloudFrontDomain}/`, '');
      }

      // For direct S3 URLs
      const s3UrlPattern = new RegExp(
        `https://${this.bucketName}\\.s3\\.${this.region}\\.amazonaws\\.com/(.+)`,
      );
      const match = url.match(s3UrlPattern);

      return match ? match[1] : null;
    } catch (error) {
      return null;
    }
  }
}
