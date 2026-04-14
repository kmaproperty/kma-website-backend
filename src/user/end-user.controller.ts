import { Controller, Post, Body, Get, Put, Delete, Req, Query, Param, BadRequestException, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiHeader } from '@nestjs/swagger';
import { UserService } from './user.service';
import { PropertyViewTrackerService } from './services/property-view-tracker.service';
import { SearchTrackerService } from './services/search-tracker.service';
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
  CreateSessionResponseDto,
  EndUserCitiesQueryDto,
  EndUserPropertiesSearchQueryDto,
  EndUserPropertiesSearchResponseDto,
  EndUserPropertiesCountQueryDto,
  EndUserPropertiesCountResponseDto,
  EndUserTopPropertiesQueryDto,
  EndUserTopPropertiesResponseDto,
  EndUserFeaturedPropertiesQueryDto,
  EndUserFeaturedPropertiesResponseDto,
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
  SubmitPropertyRatingReviewBodyDto,
  SubmitPropertyRatingReviewResponseDto,
  GetMyPropertyRatingReviewResponseDto,
  GetPropertyRatingReviewsQueryDto,
  GetPropertyRatingReviewsResponseDto,
  GetPropertyMediaResponseDto,
  SimilarPropertiesQueryDto,
  SimilarPropertiesResponseDto,
  UserActivityCountsResponseDto,
  ActivityListQueryDto,
  RecentlyViewedListResponseDto,
  ContactedPropertiesListResponseDto,
  GetSearchHistoryQueryDto,
  GetSearchHistoryResponseDto,
  SendOtpContactPropertyDto,
  SendOtpContactPropertyResponseDto,
  SubmitContactPropertyDto,
  SubmitContactPropertyResponseDto,
  ListFiltersQueryDto,
  ListFiltersResponseDto,
} from './dto';
import {
  SubmitCPReviewDto,
  SubmitCPReviewResponseDto,
  CPReviewsListQueryDto,
  CPReviewsListResponseDto,
  GetMyCPReviewResponseDto,
} from './dto/channel-partner-review.dto';
import { Request } from 'express';

@ApiTags('End User')
@Controller('end-user')
@UseGuards(JwtAuthGuard)
export class EndUserController {
  constructor(
    private readonly userService: UserService,
    private readonly propertyViewTracker: PropertyViewTrackerService,
    private readonly searchTrackerService: SearchTrackerService,
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
  @ApiHeader({
    name: 'X-Session-Id',
    description: 'Session ID (optional - for merging property views/search after signup; send the same value used on anonymous requests)',
    required: false,
  })
  @ApiOperation({
    summary: 'End User Verify OTP - Complete Signup',
    description: 'Verify the OTP received on mobile number and complete the end user account creation. Returns access and refresh tokens upon successful verification. Send X-Session-Id header to merge anonymous session data after signup.',
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
    @Req() req: Request,
  ): Promise<EndUserVerifyOtpResponseDto> {
    const sessionId = (req.headers['x-session-id'] as string)?.trim() || null;
    return await this.userService.verifyEndUserOtp(verifyOtpDto, sessionId);
  }

  @Get('search-suggest')
  @Public()
  @ApiOperation({
    summary: 'Unified search suggestions',
    description: 'Search across cities, localities, and societies for the main search bar. Returns grouped results.',
  })
  async searchSuggest(
    @Query('q') q: string,
    @Query('limit') limit?: string,
    @Query('listingTypeId') listingTypeId?: string,
    @Query('categoryId') categoryId?: string,
    @Query('propertyTypeIds') propertyTypeIds?: string,
  ) {
    const parsedLimit = limit ? parseInt(limit, 10) : 8;
    return await this.userService.searchSuggest(q || '', parsedLimit, {
      listingTypeId,
      categoryId,
      propertyTypeIds,
    });
  }

  @Post('cross-app-login')
  @Public()
  @ApiOperation({
    summary: 'Cross-App Login',
    description: 'Owner/CP navigating from seller to buyer app. Finds or creates an END_USER account for the same phone and returns END_USER tokens.',
  })
  @ApiResponse({ status: 200, description: 'END_USER tokens returned' })
  @ApiResponse({ status: 401, description: 'Invalid or expired seller token' })
  async crossAppLogin(
    @Body() body: { accessToken: string },
  ) {
    return await this.userService.crossAppLogin(body.accessToken);
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
  @ApiHeader({
    name: 'X-Session-Id',
    description: 'Session ID (optional - for merging property views/search after login; send the same value used on anonymous requests)',
    required: false,
  })
  @ApiOperation({
    summary: 'End User Verify Login OTP',
    description: 'Verify the OTP received on mobile number and complete the login. Returns access and refresh tokens upon successful verification. Send X-Session-Id header to merge anonymous session data after login.',
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
    @Req() req: Request,
  ): Promise<EndUserVerifyLoginOtpResponseDto> {
    const sessionId = (req.headers['x-session-id'] as string)?.trim() || null;
    return await this.userService.verifyEndUserLoginOtp(verifyOtpDto, sessionId);
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

  @Get('session')
  @Public()
  @ApiOperation({
    summary: 'Create Session',
    description:
      'Generate a new session ID for anonymous users. Call this once when the app loads, then send the returned sessionId in the X-Session-Id header on all subsequent requests (property search, property details, etc.) so that seen properties and recent searches can be tracked and merged when the user logs in.',
  })
  @ApiResponse({
    status: 200,
    description: 'Session created successfully',
    type: CreateSessionResponseDto,
  })
  async createSession(@Req() req: Request): Promise<CreateSessionResponseDto> {
    const ip =
      (req as Request & { ip?: string }).ip ||
      req.socket?.remoteAddress ||
      '';
    const userAgent = req.headers['user-agent'];
    return await this.propertyViewTracker.createSession(ip, userAgent);
  }

  @Get('activity-counts')
  @Public()
  @ApiBearerAuth('access-token')
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token (optional - if provided, counts use userId)',
    required: false,
  })
  @ApiHeader({
    name: 'X-Session-Id',
    description:
      'Session ID (optional - for non-logged-in users; used for recentlySearch and recentlyViewed counts)',
    required: false,
  })
  @ApiOperation({
    summary: 'Get Activity Counts',
    description:
      'Returns counts for the user panel: Recently Search, Recently Viewed, Saved Properties, Contacted Properties. For logged-in users use Authorization header (counts by userId). For non-logged-in users use X-Session-Id header (recentlySearch and recentlyViewed by session; savedProperties and contactedProperties are 0).',
  })
  @ApiResponse({
    status: 200,
    description: 'Activity counts retrieved successfully',
    type: UserActivityCountsResponseDto,
  })
  async getActivityCounts(
    @Req() req: Request,
  ): Promise<UserActivityCountsResponseDto> {
    const userId = req.user?.id ?? null;
    const sessionId =
      (req.headers['x-session-id'] as string)?.trim() || null;
    return await this.userService.getActivityCounts(sessionId, userId);
  }

  @Get('recently-viewed')
  @Public()
  @ApiBearerAuth('access-token')
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token (optional - if provided, uses userId)',
    required: false,
  })
  @ApiHeader({
    name: 'X-Session-Id',
    description: 'Session ID (optional - for non-logged-in users)',
    required: false,
  })
  @ApiOperation({
    summary: 'Get Recently Viewed Properties',
    description:
      'Returns paginated list of recently viewed properties with full property details. For logged-in users use Authorization header. For non-logged-in users use X-Session-Id header.',
  })
  @ApiResponse({
    status: 200,
    description: 'Recently viewed properties retrieved successfully',
    type: RecentlyViewedListResponseDto,
  })
  async getRecentlyViewed(
    @Query() query: ActivityListQueryDto,
    @Req() req: Request,
  ): Promise<RecentlyViewedListResponseDto> {
    const userId = req.user?.id ?? null;
    const sessionId =
      (req.headers['x-session-id'] as string)?.trim() || null;
    return await this.userService.getRecentlyViewed(sessionId, userId, query);
  }

  @Get('recently-searched')
  @Public()
  @ApiBearerAuth('access-token')
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token (optional - if provided, uses userId)',
    required: false,
  })
  @ApiHeader({
    name: 'X-Session-Id',
    description: 'Session ID (optional - for non-logged-in users)',
    required: false,
  })
  @ApiOperation({
    summary: 'Get Recently Searched',
    description:
      'Returns paginated list of recent search queries with filters. For logged-in users use Authorization header. For non-logged-in users use X-Session-Id header.',
  })
  @ApiResponse({
    status: 200,
    description: 'Recent searches retrieved successfully',
    type: GetSearchHistoryResponseDto,
  })
  async getRecentlySearched(
    @Query() query: GetSearchHistoryQueryDto,
    @Req() req: Request,
  ): Promise<GetSearchHistoryResponseDto> {
    const userId = req.user?.id ?? null;
    const sessionId =
      (req.headers['x-session-id'] as string)?.trim() || null;
    return await this.userService.getRecentlySearched(sessionId, userId, query);
  }

  @Get('contacted-properties')
  @Public()
  @ApiBearerAuth('access-token')
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token (optional - if provided, uses userId)',
    required: false,
  })
  @ApiHeader({
    name: 'X-Session-Id',
    description: 'Session ID (optional - for non-logged-in users)',
    required: false,
  })
  @ApiOperation({
    summary: 'Get Contacted Properties',
    description:
      'Returns paginated list of properties the user has contacted/inquired about. For logged-in users use Authorization header. For non-logged-in users use X-Session-Id header.',
  })
  @ApiResponse({
    status: 200,
    description: 'Contacted properties retrieved successfully',
    type: ContactedPropertiesListResponseDto,
  })
  async getContactedProperties(
    @Query() query: ActivityListQueryDto,
    @Req() req: Request,
  ): Promise<ContactedPropertiesListResponseDto> {
    const userId = req.user?.id ?? null;
    const sessionId =
      (req.headers['x-session-id'] as string)?.trim() || null;
    return await this.userService.getContactedProperties(sessionId, userId, query);
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

  @Get('states')
  @Public()
  @ApiOperation({
    summary: 'Get all states',
    description: 'Returns a list of all distinct states from the cities database.',
  })
  @ApiResponse({ status: 200, description: 'States list retrieved successfully' })
  async getStates() {
    const states = await this.userService.getStates();
    return { success: true, data: states };
  }

  @Get('states/:state/cities')
  @Public()
  @ApiOperation({
    summary: 'Get cities by state',
    description: 'Returns all cities belonging to the specified state.',
  })
  @ApiResponse({ status: 200, description: 'Cities list retrieved successfully' })
  async getCitiesByState(@Param('state') state: string) {
    const cities = await this.userService.getCitiesByState(state);
    return { success: true, data: cities };
  }

  @Get('properties')
  @Public()
  @ApiBearerAuth('access-token')
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token (optional - if provided, includes isFavorite status for each property)',
    required: false,
  })
  @ApiHeader({
    name: 'X-Session-Id',
    description:
      'Session ID from GET /end-user/session (optional - for recording search in search_history when anonymous)',
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
    const userId = req.user?.id;
    const isAuthenticated = !!userId;
    const result = await this.userService.searchEndUserProperties(query, userId);

    // Record in search_history when user performs a search or applies any filter
    const hasSearch =
      (query.search && query.search.trim().length > 0) ||
      query.cityId ||
      (query.categoryIds && query.categoryIds.length > 0) ||
      (query.listingTypeIds && query.listingTypeIds.length > 0) ||
      (query.propertyTypeIds && query.propertyTypeIds.length > 0) ||
      (query.bhkTypeIds && query.bhkTypeIds.length > 0) ||
      (query.furnishingTypes && query.furnishingTypes.length > 0) ||
      (query.constructionStatuses && query.constructionStatuses.length > 0) ||
      query.minPrice != null ||
      query.maxPrice != null ||
      (query.latitude != null &&
        query.longitude != null) ||
      (query.postedBy && query.postedBy.length > 0);

    if (hasSearch) {
      const sessionId =
        (req.headers['x-session-id'] as string)?.trim() || null;
      const ip =
        (req as Request & { ip?: string }).ip ||
        req.socket?.remoteAddress ||
        '';
      const userAgent = req.headers['user-agent'];
      const searchQuery = query.search?.trim() || 'Properties';
      const location =
        query.latitude != null && query.longitude != null
          ? 'Near Me'
          : undefined;
      const priceRange =
        query.minPrice != null || query.maxPrice != null
          ? [query.minPrice, query.maxPrice]
              .filter((n) => n != null)
              .map((n) => `₹${(n! / 1_00_000).toFixed(0)}L`)
              .join(' - ')
          : undefined;

      // Save query params as-is in filters so UI can replay the same search
      const filtersToStore: Record<string, unknown> = {};
      const queryObj = query as unknown as Record<string, unknown>;
      for (const key of Object.keys(queryObj)) {
        const value = queryObj[key];
        if (value !== undefined && value !== null) {
          filtersToStore[key] = value;
        }
      }

      try {
        await this.searchTrackerService.recordSearch(
          sessionId,
          ip,
          userAgent,
          searchQuery,
          isAuthenticated,
          userId ?? null,
          location,
          undefined,
          priceRange,
          Object.keys(filtersToStore).length > 0 ? filtersToStore : undefined,
        );
      } catch {
        // Don't fail the search response if recording fails
      }
    }

    return result;
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

  @Get('featured-properties')
  @Public()
  @ApiOperation({
    summary: 'Get Featured Properties',
    description: 'Returns featured properties filtered by city. Only returns active properties marked as featured.',
  })
  @ApiResponse({
    status: 200,
    description: 'Featured properties retrieved successfully',
    type: EndUserFeaturedPropertiesResponseDto,
  })
  async getFeaturedProperties(
    @Query() query: EndUserFeaturedPropertiesQueryDto,
  ): Promise<EndUserFeaturedPropertiesResponseDto> {
    return await this.userService.getFeaturedProperties(query);
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
  ): Promise<EndUserPropertyDetailsResponseDto> {
    // Check if user is authenticated
    const isAuthenticated = !!(req as any).user?.id;

    // Get headers from request
    const userAgent = req.headers['user-agent'] as string | undefined;
    const sessionId = req.headers['x-session-id'] as string | undefined;

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
      propertyId,
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

    // Record the view (session_property_views for anonymous, seen_properties for logged-in)
    const newSessionId = await this.propertyViewTracker.recordView(
      sessionId || null,
      clientIp,
      userAgent,
      propertyId,
      isAuthenticated,
      (req as any).user?.id,
    );

    // Add remaining views info and sessionId to response
    return {
      ...propertyDetails,
      remainingViews: viewCheck.remainingViews,
      sessionId: isAuthenticated ? undefined : newSessionId, // Only return sessionId for non-authenticated users
    };
  }

  @Post('properties/:propertyId/contact/send-otp')
  @Public()
  @ApiParam({
    name: 'propertyId',
    description: 'Property ID to contact',
    example: 'uuid-string',
  })
  @ApiOperation({
    summary: 'Send OTP for Contact Property (Non-logged-in users)',
    description:
      'Send OTP to phone number. Required before submitting the contact form when not logged in. Use the OTP in POST /end-user/properties/:propertyId/contact.',
  })
  @ApiResponse({
    status: 200,
    description: 'OTP sent successfully',
    type: SendOtpContactPropertyResponseDto,
  })
  async sendOtpForContactProperty(
    @Param('propertyId') _propertyId: string,
    @Body() sendOtpDto: SendOtpContactPropertyDto,
  ): Promise<SendOtpContactPropertyResponseDto> {
    return await this.userService.sendOtpForContactProperty(sendOtpDto);
  }

  @Post('properties/:propertyId/contact')
  @Public()
  @ApiParam({
    name: 'propertyId',
    description: 'Property ID to contact',
    example: 'uuid-string',
  })
  @ApiBearerAuth('access-token')
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token (optional - if provided, no OTP required)',
    required: false,
  })
  @ApiHeader({
    name: 'X-Session-Id',
    description:
      'Session ID (required for non-logged-in users)',
    required: false,
  })
  @ApiOperation({
    summary: 'Submit Contact Property Form',
    description:
      'Submit the contact form for a property. Logged-in: send Authorization header; no OTP. Non-logged-in: send X-Session-Id header and otp from POST .../contact/send-otp.',
  })
  @ApiResponse({
    status: 200,
    description: 'Contact request submitted successfully',
    type: SubmitContactPropertyResponseDto,
  })
  async submitContactProperty(
    @Param('propertyId') propertyId: string,
    @Body() submitDto: SubmitContactPropertyDto,
    @Req() req: Request,
  ): Promise<SubmitContactPropertyResponseDto> {
    const userId = (req as any).user?.id ?? null;
    const sessionId =
      (req.headers['x-session-id'] as string)?.trim() || null;
    return await this.userService.submitContactProperty(
      propertyId,
      submitDto,
      userId,
      sessionId,
    );
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
      'Submit or update a rating and review for a property. Only logged-in end users can submit ratings and reviews. One review per user per property is maintained (subsequent calls update the existing review). Property ID is taken from the URL path; do not send it in the request body.',
  })
  @ApiParam({
    name: 'propertyId',
    description: 'Property ID to rate (path param only; omit from body)',
    example: 'd6f12fb4-0b88-4d36-8927-63a9dd86b321',
  })
  @ApiResponse({
    status: 200,
    description: 'Property rating and review submitted successfully',
    type: SubmitPropertyRatingReviewResponseDto,
  })
  async submitPropertyRatingReview(
    @Req() req: Request,
    @Param('propertyId') propertyId: string,
    @Body() body: SubmitPropertyRatingReviewBodyDto,
  ): Promise<SubmitPropertyRatingReviewResponseDto> {
    if (!req.user?.id) {
      throw new BadRequestException('User not authenticated');
    }

    return await this.userService.submitPropertyRatingReview(
      req.user.id,
      propertyId,
      body,
    );
  }

  @Get('properties/:propertyId/rating-reviews')
  @Public()
  @ApiOperation({
    summary: 'Get rating and reviews for a property',
    description:
      'Get aggregated ratings and paginated reviews for a property: overall summary (average rating, total reviews, star distribution), feature ratings (connectivity, neighbourhood, safety, livability), what\'s good / what\'s bad from reviews, and paginated individual reviews. Supports search (q), filter by star rating, and sort (recommended, newest, oldest, highest, lowest). Public endpoint.',
  })
  @ApiParam({
    name: 'propertyId',
    description: 'Property ID',
    example: 'd6f12fb4-0b88-4d36-8927-63a9dd86b321',
  })
  @ApiResponse({
    status: 200,
    description: 'Rating and reviews retrieved successfully',
    type: GetPropertyRatingReviewsResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Property is not available (not found, deleted, or inactive)',
  })
  async getPropertyRatingReviews(
    @Param('propertyId') propertyId: string,
    @Query() query: GetPropertyRatingReviewsQueryDto,
  ): Promise<GetPropertyRatingReviewsResponseDto> {
    return await this.userService.getPropertyRatingReviews(propertyId, query);
  }

  @Get('properties/:propertyId/media')
  @Public()
  @ApiOperation({
    summary: 'Get property media (gallery)',
    description:
      'Get photos and videos for the Property Gallery screen. Returns media grouped by category (Cover Image, Exterior, Bedroom, etc.), including verified live photos from property verification. Supports 40 Photos, 2 Videos display.',
  })
  @ApiParam({
    name: 'propertyId',
    description: 'Property ID',
    example: 'd6f12fb4-0b88-4d36-8927-63a9dd86b321',
  })
  @ApiResponse({
    status: 200,
    description: 'Property media retrieved successfully',
    type: GetPropertyMediaResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Property is not available (not found, deleted, or inactive)',
  })
  async getPropertyMedia(
    @Param('propertyId') propertyId: string,
  ): Promise<GetPropertyMediaResponseDto> {
    return await this.userService.getPropertyMedia(propertyId);
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

  @Get('my-reviews')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Get My Reviews',
    description: 'Get all property reviews submitted by the logged-in user. Returns paginated list with property details, ratings, and review text.',
  })
  @ApiResponse({ status: 200, description: 'User reviews retrieved successfully' })
  async getMyReviews(
    @Req() req: Request,
    @Query() query: any,
  ) {
    if (!req.user?.id) {
      throw new BadRequestException('User not authenticated');
    }
    return await this.userService.getMyReviews(req.user.id, query);
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

  @Get('filters')
  @Public()
  @ApiOperation({
    summary: 'List property filters',
    description:
      'Get flat lists of listing types, categories, property types, and BHK types for filter dropdowns. Optional listingTypeId and categoryId filter property types. Optional propertyTypeId drives BHK types (empty for Plot and Commercial category).',
  })
  @ApiResponse({
    status: 200,
    description: 'Filters retrieved successfully',
    type: ListFiltersResponseDto,
  })
  async getListFilters(@Query() query: ListFiltersQueryDto): Promise<ListFiltersResponseDto> {
    return await this.userService.getListFilters(query);
  }

  @Get('nearby-places')
  @Public()
  @ApiOperation({
    summary: 'Get nearby places by type',
    description:
      'Returns nearby places (schools, hospitals, gyms, restaurants, bus stops, clinics) for a given lat/lng. Used by the property detail page Locality section. Pass type as: school, hospital, clinic, gym, restaurant, bus_stop.',
  })
  @ApiResponse({ status: 200, description: 'Nearby places retrieved successfully' })
  async getNearbyPlaces(
    @Query('latitude') latitude: string,
    @Query('longitude') longitude: string,
    @Query('type') type: string,
    @Query('radius') radius?: string,
  ) {
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    const rad = radius ? parseInt(radius, 10) : 2000;
    return await this.userService.getNearbyPlaces(lat, lng, type, rad);
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

  // ─── OTHER SCREENS PUBLIC ENDPOINTS ─────────────────────────────

  @Get('team-members')
  @Public()
  @ApiOperation({
    summary: 'Get Team Members',
    description: 'Get all team members for the Meet the Team page. Returns founders first, then sorted by display order.',
  })
  @ApiResponse({
    status: 200,
    description: 'Team members retrieved successfully',
  })
  async getTeamMembers(): Promise<any> {
    return await this.userService.getTeamMembers();
  }

  @Get('regional-offices')
  @Public()
  @ApiOperation({
    summary: 'Get Regional Offices',
    description: 'Get all regional offices for the Sales Enquiry page.',
  })
  @ApiResponse({
    status: 200,
    description: 'Regional offices retrieved successfully',
  })
  async getRegionalOffices(): Promise<any> {
    return await this.userService.getRegionalOffices();
  }

  @Get('help-center')
  @Public()
  @ApiOperation({
    summary: 'Get Help Center FAQs',
    description: 'Get all FAQs for the Help Center page. Optionally filter by category.',
  })
  @ApiResponse({
    status: 200,
    description: 'FAQs retrieved successfully',
  })
  async getHelpCenterFaqs(
    @Query('category') category?: string,
  ): Promise<any> {
    return await this.userService.getHelpCenterFaqs(category);
  }

  // ─── Channel Partner Reviews ───────────────────────────────────────

  @Post('channel-partners/:id/review')
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Submit review for a channel partner',
    description:
      'Submit or update a rating and review for a channel partner. One review per user per channel partner is maintained (subsequent calls update the existing review). Authenticated users only.',
  })
  @ApiParam({
    name: 'id',
    description: 'Channel Partner ID (user ID)',
    example: 'd6f12fb4-0b88-4d36-8927-63a9dd86b321',
  })
  @ApiResponse({
    status: 200,
    description: 'Review submitted successfully',
    type: SubmitCPReviewResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Channel partner not found or invalid data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Authentication required',
  })
  async submitChannelPartnerReview(
    @Req() req: Request,
    @Param('id') channelPartnerId: string,
    @Body() body: SubmitCPReviewDto,
  ): Promise<SubmitCPReviewResponseDto> {
    if (!req.user?.id) {
      throw new BadRequestException('User not authenticated');
    }

    return await this.userService.submitChannelPartnerReview(
      channelPartnerId,
      req.user.id,
      body,
    );
  }

  @Get('channel-partners/:id/reviews')
  @Public()
  @ApiOperation({
    summary: 'Get reviews for a channel partner',
    description:
      'Get aggregated ratings (average, star distribution) and paginated reviews for a channel partner. Supports sorting by newest, oldest, highest, lowest. Public endpoint.',
  })
  @ApiParam({
    name: 'id',
    description: 'Channel Partner ID (user ID)',
    example: 'd6f12fb4-0b88-4d36-8927-63a9dd86b321',
  })
  @ApiResponse({
    status: 200,
    description: 'Reviews retrieved successfully',
    type: CPReviewsListResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Channel partner not found',
  })
  async getChannelPartnerReviews(
    @Param('id') channelPartnerId: string,
    @Query() query: CPReviewsListQueryDto,
  ): Promise<CPReviewsListResponseDto> {
    return await this.userService.getChannelPartnerReviews(channelPartnerId, query);
  }

  @Get('channel-partners/:id/review/me')
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Get my review for a channel partner',
    description:
      "Fetch the logged-in user's existing review for a given channel partner. Useful to pre-fill the review form if a review was already submitted.",
  })
  @ApiParam({
    name: 'id',
    description: 'Channel Partner ID (user ID)',
    example: 'd6f12fb4-0b88-4d36-8927-63a9dd86b321',
  })
  @ApiResponse({
    status: 200,
    description: 'Review retrieved successfully',
    type: GetMyCPReviewResponseDto,
  })
  async getMyChannelPartnerReview(
    @Req() req: Request,
    @Param('id') channelPartnerId: string,
  ): Promise<GetMyCPReviewResponseDto> {
    if (!req.user?.id) {
      throw new BadRequestException('User not authenticated');
    }

    return await this.userService.getMyChannelPartnerReview(
      req.user.id,
      channelPartnerId,
    );
  }

}

