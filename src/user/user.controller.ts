import { Controller, Post, Body, Get, Req } from '@nestjs/common';
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
  ResendOtpDto,
  ResendOtpResponseDto,
  RefreshTokenDto,
  RefreshTokenResponseDto,
  LogoutResponseDto,
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
  async sendOtp(@Body() sendOtpDto: SendOtpDto): Promise<SendOtpResponseDto> {
    return await this.userService.sendOtp(sendOtpDto);
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

  @Get('/profile')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({
    status: 200,
    description: 'User details',
  })
  async getUserProfile(@Req() req: Request) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const userId = (req as any).user?.id;
    if (!userId) {
      throw new Error('User not authenticated');
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const user = await this.userService.getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  @Post('resend-otp')
  @ApiOperation({ summary: 'Resend OTP to phone number' })
  @ApiResponse({
    status: 200,
    description: 'OTP resent successfully',
    type: ResendOtpResponseDto,
  })
  async resendOtp(
    @Body() resendOtpDto: ResendOtpDto,
  ): Promise<ResendOtpResponseDto> {
    return await this.userService.resendOtp(resendOtpDto);
  }

  @Post('refresh-token')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  @ApiResponse({
    status: 200,
    description: 'Token refreshed successfully',
    type: RefreshTokenResponseDto,
  })
  async refreshToken(
    @Body() refreshTokenDto: RefreshTokenDto,
  ): Promise<RefreshTokenResponseDto> {
    return await this.userService.refreshToken(refreshTokenDto);
  }

  @Post('logout')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Logout user and clear tokens' })
  @ApiResponse({
    status: 200,
    description: 'Logged out successfully',
    type: LogoutResponseDto,
  })
  async logout(@Req() req: Request): Promise<LogoutResponseDto> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const userId = (req as any).user?.id;
    if (!userId) {
      throw new Error('User not authenticated');
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return await this.userService.logout(userId);
  }
}
