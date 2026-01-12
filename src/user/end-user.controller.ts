import { Controller, Post, Body, Get, Put, Req, Query, Param, BadRequestException, UnauthorizedException, Headers, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiHeader } from '@nestjs/swagger';
import { UserService } from './user.service';
import { PropertyViewTrackerService } from './services/property-view-tracker.service';
import { Public } from '../common/decorators/public.decorator';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
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
  EndUserPropertyDetailsResponseDto,
  SendOtpForContactUsDto,
  SendOtpForContactUsResponseDto,
  SubmitContactUsDto,
  ContactUsResponseDto,
  SubmitRatingReviewDto,
  SubmitRatingReviewResponseDto,
  PropertyMasterDataResponseDto,
} from './dto';
import { Request } from 'express';

@ApiTags('End User')
@Controller('end-user')
@UseGuards(JwtAuthGuard)
export class EndUserController {
  constructor(
    private readonly userService: UserService,
    private readonly propertyViewTracker: PropertyViewTrackerService,
  ) {}

  @Post('signup')
  @Public()
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
  @Public()
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
  @Public()
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
  @Public()
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
  @Public()
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
  @Public()
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
  @Public()
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
  @Public()
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

  @Get('properties/:id')
  @Public()
  @ApiOperation({
    summary: 'Get Property Details',
    description: 'Get detailed information about a specific property. Unauthenticated users can view up to 3 properties, then login is required. Authenticated users have unlimited access.',
  })
  @ApiParam({
    name: 'id',
    description: 'Property ID',
    example: 'd6f12fb4-0b88-4d36-8927-63a9dd86b321',
    type: String,
  })
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token (optional - for authenticated users)',
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Property details retrieved successfully',
    type: EndUserPropertyDetailsResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Login required - Maximum free views (3) exceeded',
  })
  @ApiResponse({
    status: 404,
    description: 'Property not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Property is not available (not approved or deleted)',
  })
  async getPropertyDetails(
    @Param('id') propertyId: string,
    @Req() req: Request,
    @Headers('user-agent') userAgent?: string,
  ): Promise<EndUserPropertyDetailsResponseDto> {
    // Check if user is authenticated
    const isAuthenticated = !!(req as any).user?.id;

    // Get client IP address
    const clientIp =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      (req.headers['x-real-ip'] as string) ||
      req.socket?.remoteAddress ||
      'unknown';

    // Check if user can view property
    const viewCheck = this.propertyViewTracker.canViewProperty(
      clientIp,
      userAgent,
      isAuthenticated,
    );

    if (!viewCheck.canView) {
      throw new UnauthorizedException({
        message: 'Maximum free property views exceeded. Please login to continue viewing properties.',
        requiresLogin: true,
        remainingViews: 0,
      });
    }

    // Get property details
    const propertyDetails =
      await this.userService.getEndUserPropertyDetails(propertyId);

    // Record the view for unauthenticated users
    this.propertyViewTracker.recordView(
      clientIp,
      userAgent,
      propertyId,
      isAuthenticated,
    );

    // Add remaining views info to response
    return {
      ...propertyDetails,
      remainingViews: viewCheck.remainingViews,
    };
  }

  @Post('contact-us/send-otp')
  @Public()
  @ApiOperation({
    summary: 'Send OTP for Contact Us (Non-logged in users)',
    description: 'Send OTP to phone number for contact us verification. This is for non-logged in users who want to submit a contact us query.',
  })
  @ApiResponse({
    status: 200,
    description: 'OTP sent successfully',
    type: SendOtpForContactUsResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid phone number',
  })
  async sendOtpForContactUs(
    @Body() sendOtpDto: SendOtpForContactUsDto,
  ): Promise<SendOtpForContactUsResponseDto> {
    return await this.userService.sendOtpForContactUs(sendOtpDto);
  }

  @Post('contact-us')
  @Public()
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Submit Contact Us Query (For both logged in and non-logged in users)',
    description: 'Submit a contact us query. This endpoint works for both logged in and non-logged in users. If you are logged in, provide the Bearer token and the query will be mapped to your user ID (no OTP required). If you are not logged in, you must provide the OTP code received via /end-user/contact-us/send-otp endpoint.',
  })
  @ApiResponse({
    status: 200,
    description: 'Contact us query submitted successfully',
    type: ContactUsResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid data, invalid OTP (for non-logged in), expired OTP, or user not found',
  })
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token (optional - for authenticated users)',
    required: false,
  })
  async submitContactUs(
    @Req() req: Request,
    @Body() submitDto: SubmitContactUsDto,
  ): Promise<ContactUsResponseDto> {
    // Check if user is authenticated
    const endUserId = req.user?.id || null;
    
    // Pass endUserId (null if not logged in) to service
    // Service will handle OTP verification for non-logged in users
    return await this.userService.submitContactUs(submitDto, endUserId);
  }

  @Post('rating-review')
  @Public()
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Submit Rating and Review for KMA (For both logged in and non-logged in users)',
    description: 'Submit a rating and review for KMA. This endpoint works for both logged in and non-logged in users. If you are logged in, provide the Bearer token and the rating/review will be mapped to your user ID (no OTP required). If you are not logged in, you must provide the OTP code received via /end-user/contact-us/send-otp endpoint.',
  })
  @ApiResponse({
    status: 200,
    description: 'Rating and review submitted successfully',
    type: SubmitRatingReviewResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid data, invalid OTP (for non-logged in), expired OTP, or user not found',
  })
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token (optional - for authenticated users)',
    required: false,
  })
  async submitRatingReview(
    @Req() req: Request,
    @Body() submitDto: SubmitRatingReviewDto,
  ): Promise<SubmitRatingReviewResponseDto> {
    // Check if user is authenticated
    const endUserId = req.user?.id || null;
    
    // Pass endUserId (null if not logged in) to service
    // Service will handle OTP verification for non-logged in users
    return await this.userService.submitRatingReview(submitDto, endUserId);
  }

  @Get('property-master-data')
  @Public()
  @ApiOperation({
    summary: 'Get Property Master Data',
    description: 'Get hierarchical structure of property listing types, categories, and property types. Property types are dependent on both listing type and category.',
  })
  @ApiResponse({
    status: 200,
    description: 'Property master data retrieved successfully',
    type: PropertyMasterDataResponseDto,
  })
  async getPropertyMasterData(): Promise<PropertyMasterDataResponseDto> {
    return await this.userService.getPropertyMasterData();
  }
}

