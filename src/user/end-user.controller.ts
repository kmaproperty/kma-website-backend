import { Controller, Post, Body, Get, Put, Delete, Req, Query, Param, BadRequestException, UnauthorizedException, Headers, UseGuards } from '@nestjs/common';
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
  EndUserPropertiesCountQueryDto,
  EndUserPropertiesCountResponseDto,
  EndUserTopPropertiesQueryDto,
  EndUserTopPropertiesResponseDto,
  EndUserTopCitiesResponseDto,
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
  HomePageReviewsResponseDto,
  PropertyMasterDataResponseDto,
  HomePageResponseDto,
  PropertyTypeExploreResponseDto,
  PropertyTypeExploreQueryDto,
  EndUserConfigurationResponseDto,
  AddFavoritePropertyDto,
  RemoveFavoritePropertyDto,
  FavoritePropertyResponseDto,
  FavoritePropertyListQueryDto,
  FavoritePropertyListResponseDto,
  CheckFavoritePropertyQueryDto,
  CheckFavoritePropertyResponseDto,
  SubmitPropertyRatingReviewDto,
  SubmitPropertyRatingReviewResponseDto,
  GetMyPropertyRatingReviewResponseDto,
  SimilarPropertiesQueryDto,
  SimilarPropertiesResponseDto,
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
  @ApiBearerAuth('access-token')
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token (optional - if provided, includes isFavorite status for each property)',
    required: false,
  })
  @ApiOperation({
    summary: 'Search Properties',
    description: 'Search and filter properties with various filters including city, search, category, property type, BHK, furnishing, construction status, price range, location-based search, and posted by (owner/channel partner). If user is logged in, includes isFavorite status for each property.',
  })
  @ApiResponse({
    status: 200,
    description: 'Properties retrieved successfully',
    type: EndUserPropertiesSearchResponseDto,
  })
  async searchProperties(
    @Query() query: EndUserPropertiesSearchQueryDto,
    @Req() req: Request,
  ): Promise<EndUserPropertiesSearchResponseDto> {
    // Pass userId if user is logged in (even though endpoint is public, JWT may be present)
    const userId = req.user?.id;
    return await this.userService.searchEndUserProperties(query, userId);
  }

  @Get('properties/count')
  @Public()
  @ApiOperation({
    summary: 'Get Property Count',
    description: 'Get count of properties matching the same filters as /properties endpoint. Returns only the count without pagination or sorting parameters.',
  })
  @ApiResponse({
    status: 200,
    description: 'Property count retrieved successfully',
    type: EndUserPropertiesCountResponseDto,
  })
  async getPropertiesCount(
    @Query() query: EndUserPropertiesCountQueryDto,
  ): Promise<EndUserPropertiesCountResponseDto> {
    return await this.userService.getEndUserPropertiesCount(query);
  }

  @Get('top-properties')
  @Public()
  @ApiOperation({
    summary: 'Get Top Properties',
    description: 'Returns top 5 properties filtered by city. Only returns active properties marked as top.',
  })
  @ApiResponse({
    status: 200,
    description: 'Top properties retrieved successfully',
    type: EndUserTopPropertiesResponseDto,
  })
  async getTopProperties(
    @Query() query: EndUserTopPropertiesQueryDto,
  ): Promise<EndUserTopPropertiesResponseDto> {
    return await this.userService.getTopProperties(query);
  }

  @Get('top-cities')
  @Public()
  @ApiOperation({
    summary: 'Get Top Cities',
    description: 'Returns top 5 cities with maximum approved properties. Only includes cities with at least 1 active property, ordered by property count descending.',
  })
  @ApiResponse({
    status: 200,
    description: 'Top cities retrieved successfully',
    type: EndUserTopCitiesResponseDto,
  })
  async getTopCities(): Promise<EndUserTopCitiesResponseDto> {
    return await this.userService.getTopCities();
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
    description: 'Get detailed information about a specific property. Unauthenticated users can view up to 3 unique properties, then login is required. Authenticated users have unlimited access. Returns sessionId in response for non-logged-in users to store and send in subsequent requests.',
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
  @ApiHeader({
    name: 'X-Session-Id',
    description: 'Session ID from previous request (optional - for tracking non-logged-in user views)',
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
    @Headers('x-session-id') sessionId?: string,
  ): Promise<EndUserPropertyDetailsResponseDto> {
    // Check if user is authenticated
    const isAuthenticated = !!(req as any).user?.id;

    // Get client IP address
    const clientIp =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      (req.headers['x-real-ip'] as string) ||
      req.socket?.remoteAddress ||
      'unknown';

    // Check if user can view property (async method now)
    const viewCheck = await this.propertyViewTracker.canViewProperty(
      sessionId || null,
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

    // Record the view for unauthenticated users (async method now)
    const newSessionId = await this.propertyViewTracker.recordView(
      sessionId || null,
      clientIp,
      userAgent,
      propertyId,
      isAuthenticated,
    );

    // Add remaining views info and sessionId to response
    return {
      ...propertyDetails,
      remainingViews: viewCheck.remainingViews,
      sessionId: isAuthenticated ? undefined : newSessionId, // Only return sessionId for non-authenticated users
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
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Submit Rating and Review for KMA (Logged in users only)',
    description: 'Submit a rating and review for KMA. This endpoint requires authentication. Only end users can submit ratings and reviews.',
  })
  @ApiResponse({
    status: 200,
    description: 'Rating and review submitted successfully',
    type: SubmitRatingReviewResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid data or user not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Authentication required',
  })
  async submitRatingReview(
    @Req() req: Request,
    @Body() submitDto: SubmitRatingReviewDto,
  ): Promise<SubmitRatingReviewResponseDto> {
    if (!req.user?.id) {
      throw new BadRequestException('User not authenticated');
    }
    
    return await this.userService.submitRatingReview(submitDto, req.user.id);
  }

  @Post('properties/:propertyId/rating-review')
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Submit rating and review for a specific property (logged-in users only)',
    description:
      'Submit or update a rating and review for a property. Only logged-in end users can submit ratings and reviews. One review per user per property is maintained (subsequent calls update the existing review).',
  })
  @ApiParam({
    name: 'propertyId',
    description: 'Property ID to rate',
    example: 'uuid-property-id',
  })
  @ApiResponse({
    status: 200,
    description: 'Property rating and review submitted successfully',
    type: SubmitPropertyRatingReviewResponseDto,
  })
  async submitPropertyRatingReview(
    @Req() req: Request,
    @Param('propertyId') propertyId: string,
    @Body() body: SubmitPropertyRatingReviewDto,
  ): Promise<SubmitPropertyRatingReviewResponseDto> {
    if (!req.user?.id) {
      throw new BadRequestException('User not authenticated');
    }

    const dto: SubmitPropertyRatingReviewDto = {
      ...body,
      propertyId,
    };

    return await this.userService.submitPropertyRatingReview(
      req.user.id,
      dto,
    );
  }

  @Get('properties/:propertyId/rating-review/me')
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Get my rating and review for a specific property',
    description:
      'Fetch the logged-in user\'s existing rating and review for a given property. Useful to pre-fill the rating form if a review was already submitted.',
  })
  @ApiParam({
    name: 'propertyId',
    description: 'Property ID whose rating/review to fetch',
    example: 'uuid-property-id',
  })
  @ApiResponse({
    status: 200,
    description: 'Property rating and review retrieved successfully',
    type: GetMyPropertyRatingReviewResponseDto,
  })
  async getMyPropertyRatingReview(
    @Req() req: Request,
    @Param('propertyId') propertyId: string,
  ): Promise<GetMyPropertyRatingReviewResponseDto> {
    if (!req.user?.id) {
      throw new BadRequestException('User not authenticated');
    }

    return await this.userService.getMyPropertyRatingReview(
      req.user.id,
      propertyId,
    );
  }

  @Get('home/reviews')
  @Public()
  @ApiOperation({
    summary: 'Get Home Page Reviews',
    description: 'Get top approved reviews and ratings for home page display with statistics (total count and average rating), profile pictures, and trust message. Returns minimum 4 reviews with profile images for display.',
  })
  @ApiResponse({
    status: 200,
    description: 'Home page reviews retrieved successfully',
    type: HomePageReviewsResponseDto,
  })
  async getHomePageReviews(): Promise<HomePageReviewsResponseDto> {
    return await this.userService.getHomePageReviews();
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

  @Get('home/about-us')
  @Public()
  @ApiOperation({
    summary: 'Get Home Page About Us Data',
    description: 'Get About Us content and home page statistics including total owners, channel partners, users, active properties, and properties listed in last 24 hours.',
  })
  @ApiResponse({
    status: 200,
    description: 'Home page data retrieved successfully',
    type: HomePageResponseDto,
  })
  async getHomePageData(): Promise<HomePageResponseDto> {
    return await this.userService.getHomePageData();
  }

  @Get('property-types/explore')
  @Public()
  @ApiOperation({
    summary: 'Explore Property Types',
    description: 'Get property types with their active property counts. Supports filtering by city ID, property type ID, and listing type ID. Returns property types sorted by property count (descending), excluding types with zero properties.',
  })
  @ApiResponse({
    status: 200,
    description: 'Property types with counts retrieved successfully',
    type: PropertyTypeExploreResponseDto,
  })
  async getPropertyTypesExplore(
    @Query() query: PropertyTypeExploreQueryDto,
  ): Promise<PropertyTypeExploreResponseDto> {
    return await this.userService.getPropertyTypesExplore(query);
  }

  @Get('configurations')
  @Public()
  @ApiOperation({
    summary: 'Get Admin Configurations',
    description: 'Get all admin configurations including mobile app availability and other settings.',
  })
  @ApiResponse({
    status: 200,
    description: 'Admin configurations retrieved successfully',
    type: EndUserConfigurationResponseDto,
  })
  async getAdminConfigurations(): Promise<EndUserConfigurationResponseDto> {
    return await this.userService.getAdminConfigurations();
  }

  @Post('favorites')
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Add Property to Favorites',
    description: 'Add a property to the logged-in user\'s favorites list. The property must be active and not already favorited.',
  })
  @ApiResponse({
    status: 200,
    description: 'Property added to favorites successfully',
    type: FavoritePropertyResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Property not found, not available, or already in favorites',
  })
  async addFavoriteProperty(
    @Body() dto: AddFavoritePropertyDto,
    @Req() req: Request,
  ): Promise<FavoritePropertyResponseDto> {
    if (!req.user?.id) {
      throw new BadRequestException('User not authenticated');
    }
    return await this.userService.addFavoriteProperty(req.user.id, dto);
  }

  @Delete('favorites')
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Remove Property from Favorites',
    description: 'Remove a property from the logged-in user\'s favorites list.',
  })
  @ApiResponse({
    status: 200,
    description: 'Property removed from favorites successfully',
    type: FavoritePropertyResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Property is not in favorites',
  })
  async removeFavoriteProperty(
    @Body() dto: RemoveFavoritePropertyDto,
    @Req() req: Request,
  ): Promise<FavoritePropertyResponseDto> {
    if (!req.user?.id) {
      throw new BadRequestException('User not authenticated');
    }
    return await this.userService.removeFavoriteProperty(req.user.id, dto);
  }

  @Get('favorites')
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Get Favorite Properties',
    description: 'Get paginated list of properties favorited by the logged-in user.',
  })
  @ApiResponse({
    status: 200,
    description: 'Favorite properties retrieved successfully',
    type: FavoritePropertyListResponseDto,
  })
  async getFavoriteProperties(
    @Query() query: FavoritePropertyListQueryDto,
    @Req() req: Request,
  ): Promise<FavoritePropertyListResponseDto> {
    if (!req.user?.id) {
      throw new BadRequestException('User not authenticated');
    }
    return await this.userService.getFavoriteProperties(req.user.id, query);
  }

  @Get('favorites/check')
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Check if Property is Favorited',
    description: 'Check if a specific property is in the logged-in user\'s favorites list.',
  })
  @ApiResponse({
    status: 200,
    description: 'Favorite status retrieved successfully',
    type: CheckFavoritePropertyResponseDto,
  })
  async checkFavoriteProperty(
    @Query() query: CheckFavoritePropertyQueryDto,
    @Req() req: Request,
  ): Promise<CheckFavoritePropertyResponseDto> {
    if (!req.user?.id) {
      throw new BadRequestException('User not authenticated');
    }
    return await this.userService.checkFavoriteProperty(req.user.id, query.propertyId);
  }

  @Get('properties/similar')
  @Public()
  @ApiBearerAuth('access-token')
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token (optional - if provided, includes isFavorite status for each property)',
    required: false,
  })
  @ApiOperation({
    summary: 'Get Similar Properties',
    description: 'Get similar properties based on city and optionally property type. Returns active properties in the same city. If user is logged in, includes isFavorite status for each property.',
  })
  @ApiResponse({
    status: 200,
    description: 'Similar properties retrieved successfully',
    type: SimilarPropertiesResponseDto,
  })
  async getSimilarProperties(
    @Query() query: SimilarPropertiesQueryDto,
    @Req() req: Request,
  ): Promise<SimilarPropertiesResponseDto> {
    // Pass userId if user is logged in (even though endpoint is public, JWT may be present)
    const userId = req.user?.id;
    return await this.userService.getSimilarProperties(query, userId);
  }
}

