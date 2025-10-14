import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { UploadsService } from './uploads.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { Auth } from '../user/auth/decorators/auth.decorator';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiTags,
  ApiConsumes,
} from '@nestjs/swagger';
import { ApiResponseDto } from 'src/common/dto';
import { MESSAGES } from './constants/upload.constant';

@ApiTags('Uploads')
@ApiBearerAuth()
@Auth()
@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @ApiOperation({ summary: 'Upload a file (PNG, JPG, JPEG)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description:
            'Select a file to upload (PNG, JPG, JPEG files only, max 5MB)',
        },
      },
      required: ['file'],
    },
    description: 'Upload a file (PNG, JPG, JPEG) via form data.',
  })
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    const result = await this.uploadsService.uploadFile(file);
    return ApiResponseDto.success(result, MESSAGES.FILE_UPLOAD.SUCCESS);
  }
}
