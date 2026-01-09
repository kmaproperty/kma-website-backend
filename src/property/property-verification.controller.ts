import {
  Controller,
  Post,
  Body,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PropertyService } from './property.service';
import { Public } from '../common/decorators/public.decorator';
import {
  SubmitPropertyVerificationMediaDto,
  SubmitPropertyVerificationMediaResponseDto,
} from './dto/property-verification.dto';

@ApiTags('Property Verification')
@Controller('property-verification')
export class PropertyVerificationController {
  constructor(private readonly propertyService: PropertyService) {}

  @Post('submit-media')
  @Public()
  @ApiOperation({
    summary: 'Submit property verification media (Public)',
    description: 'Public endpoint to submit live photos and videos for property verification using the verification token from the verification link.',
  })
  @ApiResponse({
    status: 200,
    description: 'Verification media submitted successfully',
    type: SubmitPropertyVerificationMediaResponseDto,
  })
  async submitPropertyVerificationMedia(
    @Body() body: SubmitPropertyVerificationMediaDto,
  ): Promise<SubmitPropertyVerificationMediaResponseDto> {
    return await this.propertyService.submitPropertyVerificationMedia(body);
  }
}

