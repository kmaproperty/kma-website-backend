import { Controller, Post, Body, Get, Put, Req, Query, Param, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { UserService } from './user.service';
import {
  EndUserSignupDto,
  EndUserSignupResponseDto,
  EndUserVerifyOtpDto,
  EndUserVerifyOtpResponseDto,
  EndUserLoginDto,
  EndUserLoginResponseDto,
  EndUserVerifyLoginOtpDto,
  EndUserVerifyLoginOtpResponseDto,
  EndUserProfileResponseDto,
  EndUserEditProfileDto,
  EndUserEditProfileResponseDto,
  EndUserChangeMobileDto,
  EndUserChangeMobileResponseDto,
  EndUserVerifyChangeMobileOtpDto,
  EndUserVerifyChangeMobileOtpResponseDto,
  EndUserHomePageResponseDto,
  EndUserCitiesQueryDto,
  EndUserPropertiesSearchQueryDto,
  EndUserPropertiesSearchResponseDto,
  EndUserChannelPartnerListQueryDto,
  EndUserChannelPartnerListResponseDto,
  EndUserChannelPartnerDetailsResponseDto,
} from './dto';
import { Request } from 'express';

@ApiTags('End User')
@Controller('end-user')
export class EndUserController {
  constructor(private readonly userService: UserService) {}

  @Post('signup')
  @ApiOperation({
    summary: 'End User Signup - Send OTP',
    description: 'Create a new end user account. Provide name, email, and phone number. An OTP will be sent to the provided phone number for verification.',
  })
  @ApiResponse({
    status: 200,
    description: 'OTP sent successfully to mobile number',
    type: EndUserSignupResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - User already exists or invalid data',
  })
  async signup(
    @Body() signupDto: EndUserSignupDto,
  ): Promise<EndUserSignupResponseDto> {
    return await this.userService.signupEndUser(signupDto);
  }

  @Post('verify-otp')
  @ApiOperation({
    summary: 'End User Verify OTP - Complete Signup',
    description: 'Verify the OTP received on mobile number and complete the end user account creation. Returns access and refresh tokens upon successful verification.',
  })
  @ApiResponse({
    status: 200,
    description: 'Account created successfully',
    type: EndUserVerifyOtpResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid OTP, expired OTP, or user already exists',
  })
  async verifyOtp(
    @Body() verifyOtpDto: EndUserVerifyOtpDto,
  ): Promise<EndUserVerifyOtpResponseDto> {
    return await this.userService.verifyEndUserOtp(verifyOtpDto);
  }

  @Post('login')
  @ApiOperation({
    summary: 'End User Login - Send OTP',
    description: 'Login to existing end user account. Provide phone number and an OTP will be sent for verification.',
  })
  @ApiResponse({
    status: 200,
    description: 'OTP sent successfully to mobile number',
    type: EndUserLoginResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - User not found, account blocked, or account inactive',
  })
  async login(
    @Body() loginDto: EndUserLoginDto,
  ): Promise<EndUserLoginResponseDto> {
    return await this.userService.loginEndUser(loginDto);
  }

  @Post('verify-login-otp')
  @ApiOperation({
    summary: 'End User Verify Login OTP',
    description: 'Verify the OTP received on mobile number and complete the login. Returns access and refresh tokens upon successful verification.',
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    type: EndUserVerifyLoginOtpResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid OTP, expired OTP, account blocked, or account inactive',
  })
  async verifyLoginOtp(
    @Body() verifyOtpDto: EndUserVerifyLoginOtpDto,
  ): Promise<EndUserVerifyLoginOtpResponseDto> {
    return await this.userService.verifyEndUserLoginOtp(verifyOtpDto);
  }

  @Get('profile')
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Get End User Profile',
    description: 'Get the authenticated end user profile information including name, email, phone, and account status.',
  })
  @ApiResponse({
    status: 200,
    description: 'Profile retrieved successfully',
    type: EndUserProfileResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  async getProfile(@Req() req: Request): Promise<EndUserProfileResponseDto> {
    if (!req.user?.id) {
      throw new BadRequestException('User not authenticated');
    }
    return await this.userService.getEndUserProfile(req.user.id);
  }

  @Put('profile')
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Edit End User Profile',
    description: 'Update end user profile information (name and/or email).',
  })
  @ApiResponse({
    status: 200,
    description: 'Profile updated successfully',
    type: EndUserEditProfileResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Email already registered or invalid data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  async editProfile(
    @Req() req: Request,
    @Body() editProfileDto: EndUserEditProfileDto,
  ): Promise<EndUserEditProfileResponseDto> {
    if (!req.user?.id) {
      throw new BadRequestException('User not authenticated');
    }
    return await this.userService.editEndUserProfile(req.user.id, editProfileDto);
  }

  @Post('change-mobile')
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Change Mobile Number - Send OTP',
    description: 'Request to change mobile number. An OTP will be sent to the new mobile number for verification.',
  })
  @ApiResponse({
    status: 200,
    description: 'OTP sent successfully to new mobile number',
    type: EndUserChangeMobileResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Mobile number already registered or same as current',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  async changeMobile(
    @Req() req: Request,
    @Body() changeMobileDto: EndUserChangeMobileDto,
  ): Promise<EndUserChangeMobileResponseDto> {
    if (!req.user?.id) {
      throw new BadRequestException('User not authenticated');
    }
    return await this.userService.changeEndUserMobile(req.user.id, changeMobileDto);
  }

  @Post('verify-change-mobile-otp')
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Verify OTP and Change Mobile Number',
    description: 'Verify the OTP received on the new mobile number and complete the mobile number change.',
  })
  @ApiResponse({
    status: 200,
    description: 'Mobile number changed successfully',
    type: EndUserVerifyChangeMobileOtpResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid OTP, expired OTP, or mobile number already registered',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  async verifyChangeMobileOtp(
    @Req() req: Request,
    @Body() verifyOtpDto: EndUserVerifyChangeMobileOtpDto,
  ): Promise<EndUserVerifyChangeMobileOtpResponseDto> {
    if (!req.user?.id) {
      throw new BadRequestException('User not authenticated');
    }
    return await this.userService.verifyChangeEndUserMobile(req.user.id, verifyOtpDto);
  }

  @Get('home/cities')
  @ApiOperation({
    summary: 'Get End User Home Page Cities',
    description: 'Returns featured cities and all cities list for the home page city selection modal. Supports search by city name and location detection via latitude/longitude.',
  })
  @ApiResponse({
    status: 200,
    description: 'Cities data retrieved successfully',
    type: EndUserHomePageResponseDto,
  })
  async getHomePageCities(
    @Query() query: EndUserCitiesQueryDto,
  ): Promise<EndUserHomePageResponseDto> {
    return await this.userService.getEndUserHomePage(query);
  }

  @Get('properties')
  @ApiOperation({
    summary: 'Search Properties',
    description: 'Search and filter properties with various filters including city, search, category, property type, BHK, furnishing, construction status, price range, and location-based search.',
  })
  @ApiResponse({
    status: 200,
    description: 'Properties retrieved successfully',
    type: EndUserPropertiesSearchResponseDto,
  })
  async searchProperties(
    @Query() query: EndUserPropertiesSearchQueryDto,
  ): Promise<EndUserPropertiesSearchResponseDto> {
    return await this.userService.searchEndUserProperties(query);
  }

  @Get('channel-partners')
  @ApiOperation({
    summary: 'List Channel Partners',
    description: 'Search and filter channel partners with options to filter by name, experience, city, and number of properties. Only returns active, non-blocked, and KYC-completed channel partners.',
  })
  @ApiResponse({
    status: 200,
    description: 'Channel partners retrieved successfully',
    type: EndUserChannelPartnerListResponseDto,
  })
  async listChannelPartners(
    @Query() query: EndUserChannelPartnerListQueryDto,
  ): Promise<EndUserChannelPartnerListResponseDto> {
    return await this.userService.listChannelPartners(query);
  }

  @Get('channel-partners/:id')
  @ApiOperation({
    summary: 'Get Channel Partner Details',
    description: 'Get detailed information about a specific channel partner including profile, statistics (buyers served, experience, property holdings, areas of operation), and contact information.',
  })
  @ApiParam({
    name: 'id',
    description: 'Channel partner user ID',
    example: 'd6f12fb4-0b88-4d36-8927-63a9dd86b321',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Channel partner details retrieved successfully',
    type: EndUserChannelPartnerDetailsResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Channel partner not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Channel partner profile is not available (inactive, blocked, or KYC not completed)',
  })
  async getChannelPartnerDetails(
    @Param('id') channelPartnerId: string,
  ): Promise<EndUserChannelPartnerDetailsResponseDto> {
    return await this.userService.getChannelPartnerDetails(channelPartnerId);
  }
}

