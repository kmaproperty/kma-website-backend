import { Controller, Post, Body, Get, Param, Req } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Request } from 'express';
import { UserService } from './user.service';
import {
  SendOtpDto,
  SendOtpResponseDto,
  ValidateOtpDto,
  ValidateOtpResponseDto,
  CreateOwnerDto,
  CreateOwnerResponseDto,
  CreateChannelPartnerDto,
  CreateChannelPartnerResponseDto,
} from './dto';

@ApiTags('User Management')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('send-otp')
  @ApiOperation({ summary: 'Send OTP to phone number' })
  @ApiResponse({
    status: 200,
    description: 'OTP sent successfully',
    type: SendOtpResponseDto,
  })
  sendOtp(@Body() sendOtpDto: SendOtpDto): SendOtpResponseDto {
    return this.userService.sendOtp(sendOtpDto);
  }

  @Post('validate-otp')
  @ApiOperation({
    summary: 'Validate OTP and check if user needs additional details',
  })
  @ApiResponse({
    status: 200,
    description: 'OTP validation result',
    type: ValidateOtpResponseDto,
  })
  async validateOtp(
    @Body() validateOtpDto: ValidateOtpDto,
  ): Promise<ValidateOtpResponseDto> {
    return await this.userService.validateOtp(validateOtpDto);
  }

  @Post('create-owner')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Create OWNER account' })
  @ApiResponse({
    status: 201,
    description: 'Owner account created successfully',
  })
  async createOwner(
    @Body() createOwnerDto: CreateOwnerDto,
    @Req() req: Request,
  ): Promise<CreateOwnerResponseDto> {
    return await this.userService.createOwner(createOwnerDto, req.tokenData!);
  }

  @Post('create-channel-partner')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Create CHANNEL_PARTNER account' })
  @ApiResponse({
    status: 201,
    description: 'Channel partner account created successfully',
  })
  async createChannelPartner(
    @Body() createChannelPartnerDto: CreateChannelPartnerDto,
    @Req() req: Request,
  ): Promise<CreateChannelPartnerResponseDto> {
    return await this.userService.createChannelPartner(
      createChannelPartnerDto,
      req.tokenData!,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({
    status: 200,
    description: 'User details',
  })
  async getUserById(@Param('id') id: string) {
    const user = await this.userService.getUserById(id);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }
}
