import {
  Controller,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
import { UploadsService } from './uploads.service';
import { JwtAuthGuard } from '../user/auth/guards/jwt-auth.guard';
import {
  ApiBody,
  ApiOperation,
  ApiTags,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ApiResponseDto, ApiResponseWrapper } from 'src/common/dto';
import { GeneratePresignedUrlDto, PresignedUrlResponseDto } from './dto/generate-presigned-url.dto';

@ApiTags('Uploads')
@Controller('uploads')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @ApiOperation({ 
    summary: 'Generate a presigned URL for uploading files to S3',
    description: 'Generates a presigned URL that can be used to upload files directly from the client application to S3. The client should use the returned URL to perform a PUT request with the file data.'
  })
  @ApiBody({ type: GeneratePresignedUrlDto })
  @ApiResponse({
    status: 200,
    description: 'Presigned URL generated successfully',
    type: ApiResponseWrapper(PresignedUrlResponseDto, 'Presigned URL generated successfully'),
  })
  @Post('presigned-url')
  async generatePresignedUrl(@Body() dto: GeneratePresignedUrlDto) {
    const result = await this.uploadsService.generatePresignedUrl(dto);
    return ApiResponseDto.success(
      result,
      'Presigned URL generated successfully',
    );
  }
}
