import { Injectable, BadRequestException, UnauthorizedException, Logger } from '@nestjs/common';
import { S3Service } from '../common/aws/s3.service';
import { JwtService } from '@nestjs/jwt';
import { DataSource, IsNull } from 'typeorm';
import { CacheService } from '../common/cache/cache.service';
import { ZohoService } from '../zoho/zoho.service';
import { UserRepository } from './repositories/user.repository';
import { OtpRepository } from './repositories/otp.repository';
import { ChannelPartnerCodeRepository } from './repositories/channel-partner-code.repository';
import { User } from './entities/user.entity';
import { UserRole } from './enum/user-role.enum';
import { KycStatus } from './enum/kyc-status.enum';
import { JwtPayload, RefreshTokenPayload } from './types/jwt-payload.interface';
import { USER_MESSAGES } from './constants/user.messages';
import {
  SendOtpDto,
  SendOtpResponseDto,
  ValidateOtpDto,
  ValidateOtpResponseDto,
  CreateOwnerDto,
  CreateOwnerResponseDto,
  CreateChannelPartnerDto,
  CreateChannelPartnerResponseDto,
  CreateEndUserDto,
  CreateEndUserResponseDto,
  ResendOtpDto,
  ResendOtpResponseDto,
  RefreshTokenDto,
  RefreshTokenResponseDto,
  LogoutResponseDto,
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
  CityItemDto,
  EndUserCitiesQueryDto,
  EndUserPropertiesSearchQueryDto,
  EndUserPropertiesSearchResponseDto,
  EndUserPropertiesCountQueryDto,
  EndUserPropertiesCountResponseDto,
  EndUserPropertyListItemDto,
  EndUserPropertyUnitDto,
  EndUserPropertyImageDto,
  EndUserPropertyVideoDto,
  EndUserTopPropertiesQueryDto,
  EndUserTopPropertiesResponseDto,
  EndUserFeaturedPropertiesQueryDto,
  EndUserFeaturedPropertiesResponseDto,
  EndUserTopCityItemDto,
  EndUserTopCitiesResponseDto,
  EndUserPropertyDetailsResponseDto,
  EndUserChannelPartnerListQueryDto,
  EndUserChannelPartnerListResponseDto,
  ChannelPartnerListItemDto,
  EndUserChannelPartnerDetailsResponseDto,
  ChannelPartnerStatisticsDto,
  UploadProfilePicDto,
  UploadProfilePicResponseDto,
  GetProfilePicResponseDto,
  UploadLivePhotoDto,
  UploadLivePhotoResponseDto,
  VerifyAadhaarDto,
  VerifyAadhaarResponseDto,
  BankDetailsDto,
  BankDetailsResponseDto,
  DocuSignAgreementStatusResponseDto,
  VerificationStepsStatusResponseDto,
  GetLivePhotoResponseDto,
  GetAadhaarDetailsResponseDto,
  GetBankDetailsResponseDto,
  OwnerProfileResponseDto,
  OwnerEditProfileDto,
  OwnerEditProfileResponseDto,
  ChannelPartnerProfileResponseDto,
  ChannelPartnerEditProfileDto,
  ChannelPartnerEditProfileResponseDto,
  UserProfileResponseDto,
  UserEditProfileDto,
  UserEditProfileResponseDto,
  SendOtpForContactUsDto,
  SendOtpForContactUsResponseDto,
  SubmitContactUsDto,
  ContactUsResponseDto,
  SubmitRatingReviewDto,
  SubmitRatingReviewResponseDto,
  HomePageReviewsResponseDto,
  HomePageReviewItemDto,
  HomePageReviewsStatisticsDto,
  PropertyMasterDataResponseDto,
  ListingTypeItemDto,
  CategoryItemDto,
  PropertyTypeItemDto,
  AmenityItemDto,
  HomePageResponseDto,
  AboutUsDataDto,
  HomePageStatisticsDto,
  PropertyTypeExploreResponseDto,
  PropertyTypeExploreItemDto,
  PropertyTypeExploreQueryDto,
  EndUserConfigurationResponseDto,
  AddFavoritePropertyDto,
  RemoveFavoritePropertyDto,
  FavoritePropertyResponseDto,
  FavoritePropertyListQueryDto,
  FavoritePropertyListResponseDto,
  CheckFavoritePropertyQueryDto,
  CheckFavoritePropertyResponseDto,
  ListFiltersQueryDto,
  ListFiltersResponseDto,
  ActivityListQueryDto,
  RecentlyViewedListResponseDto,
  ContactedPropertiesListResponseDto,
  GetSearchHistoryQueryDto,
  GetSearchHistoryResponseDto,
  SearchHistoryItemDto,
} from './dto';
import { PropertyRepository } from '../property/repositories/property.repository';
import { Property } from '../property/entities/property.entity';
import { CityRepository } from '../property/repositories/city.repository';
import { PropertyListingTypeRepository } from '../property/repositories/property-listing-type.repository';
import { PropertyCategoryNewRepository } from '../property/repositories/property-category-new.repository';
import { PropertyTypeRepository } from '../property/repositories/property-type.repository';
import { BhkTypeRepository } from '../property/repositories/bhk-type.repository';
import { AmenityRepository } from '../property/repositories/amenity.repository';
import { PropertyRejectionHistoryRepository } from '../property/repositories/property-rejection-history.repository';
import { PropertyVerificationRequestRepository } from '../property/repositories/property-verification-request.repository';
import { GooglePlacesService } from '../property/services/google-places.service';
import { LeadService } from '../admin/services/lead.service';
import { PropertyStatus } from '../property/enum/property-status.enum';
import { PropertyVerificationStatus } from '../property/entities/property-verification-request.entity';
import { MAX_LISTINGS_PER_OWNER } from '../property/constants/property.constants';
import {
  DashboardResponseDto,
  SubmitPropertyRatingReviewBodyDto,
  SubmitPropertyRatingReviewResponseDto,
  GetMyPropertyRatingReviewResponseDto,
  GetPropertyRatingReviewsQueryDto,
  GetPropertyRatingReviewsResponseDto,
  GetPropertyMediaResponseDto,
  SimilarPropertiesQueryDto,
  SimilarPropertiesResponseDto,
  UserActivityCountsResponseDto,
  SendOtpContactPropertyDto,
  SendOtpContactPropertyResponseDto,
  SubmitContactPropertyDto,
  SubmitContactPropertyResponseDto,
} from './dto';
import { UpgradeToChannelPartnerDto, UpgradeToChannelPartnerResponseDto } from './dto/upgrade-channel-partner.dto';
import { LeadRepository } from './repositories/lead.repository';
import { SearchHistoryRepository } from './repositories/search-history.repository';
import { SeenPropertyRepository } from './repositories/seen-property.repository';
import { ContactedPropertyRepository } from './repositories/contacted-property.repository';
import { LeadType } from './entities/lead.entity';
import { UserRoleHistoryRepository } from './repositories/user-role-history.repository';
import { ChannelPartnerAgreementRepository } from './repositories/channel-partner-agreement.repository';
import { AgreementStatus } from './entities/channel-partner-agreement.entity';
import { BankDetailsRepository } from './repositories/bank-details.repository';
import { EncryptionService } from './services/encryption.service';
import { PropertyViewTrackerService } from './services/property-view-tracker.service';
import { ContactUsKmaQueryRepository } from './repositories/contact-us-kma-query.repository';
import { KmaRatingReviewRepository } from './repositories/kma-rating-review.repository';
import { PropertyRatingReviewRepository } from './repositories/property-rating-review.repository';
import { ChannelPartnerReviewRepository } from './repositories/channel-partner-review.repository';
import {
  SubmitCPReviewDto,
  SubmitCPReviewResponseDto,
  CPReviewsListQueryDto,
  CPReviewsListResponseDto,
  GetMyCPReviewResponseDto,
} from './dto/channel-partner-review.dto';
import { AboutUsRepository } from '../admin/repositories/about-us.repository';
import { AdminConfigurationRepository } from '../admin/repositories/admin-configuration.repository';
import { TeamMemberRepository } from '../admin/repositories/team-member.repository';
import { RegionalOfficeRepository } from '../admin/repositories/regional-office.repository';
import { HelpCenterFaqRepository } from '../admin/repositories/help-center-faq.repository';
import { FavoritePropertyRepository } from './repositories/favorite-property.repository';
import { MetaWhatsappService } from '../common/whatsapp/meta-whatsapp.service';
import { TwilioSmsService } from '../common/sms/twilio-sms.service';
import { SmartpingSmsService } from '../common/sms/smartping-sms.service';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  private readonly ACCESS_TOKEN_EXPIRY = '24h';
  private readonly REFRESH_TOKEN_EXPIRY = '7d';

  constructor(
    private readonly userRepository: UserRepository,
    private readonly otpRepository: OtpRepository,
    private readonly cityRepository: CityRepository,
    private readonly channelPartnerCodeRepository: ChannelPartnerCodeRepository,
    private readonly jwtService: JwtService,
    private readonly dataSource: DataSource,
    private readonly propertyRepository: PropertyRepository,
    private readonly googlePlacesService: GooglePlacesService,
    private readonly leadRepository: LeadRepository,
    private readonly userRoleHistoryRepository: UserRoleHistoryRepository,
    private readonly agreementRepository: ChannelPartnerAgreementRepository,
    private readonly bankDetailsRepository: BankDetailsRepository,
    private readonly encryptionService: EncryptionService,
    private readonly contactUsKmaQueryRepository: ContactUsKmaQueryRepository,
    private readonly kmaRatingReviewRepository: KmaRatingReviewRepository,
    private readonly propertyRatingReviewRepository: PropertyRatingReviewRepository,
    private readonly propertyListingTypeRepository: PropertyListingTypeRepository,
    private readonly propertyCategoryRepository: PropertyCategoryNewRepository,
    private readonly propertyTypeRepository: PropertyTypeRepository,
    private readonly bhkTypeRepository: BhkTypeRepository,
    private readonly amenityRepository: AmenityRepository,
    private readonly propertyRejectionHistoryRepository: PropertyRejectionHistoryRepository,
    private readonly propertyVerificationRequestRepository: PropertyVerificationRequestRepository,
    private readonly aboutUsRepository: AboutUsRepository,
    private readonly adminConfigurationRepository: AdminConfigurationRepository,
    private readonly favoritePropertyRepository: FavoritePropertyRepository,
    private readonly propertyViewTracker: PropertyViewTrackerService,
    private readonly searchHistoryRepository: SearchHistoryRepository,
    private readonly seenPropertyRepository: SeenPropertyRepository,
    private readonly contactedPropertyRepository: ContactedPropertyRepository,
    private readonly metaWhatsappService: MetaWhatsappService,
    private readonly twilioSmsService: TwilioSmsService,
    private readonly smartpingSmsService: SmartpingSmsService,
    private readonly s3Service: S3Service,
    private readonly teamMemberRepository: TeamMemberRepository,
    private readonly regionalOfficeRepository: RegionalOfficeRepository,
    private readonly helpCenterFaqRepository: HelpCenterFaqRepository,
    private readonly channelPartnerReviewRepository: ChannelPartnerReviewRepository,
    private readonly leadService: LeadService,
    private readonly cache: CacheService,
    private readonly zohoService: ZohoService,
  ) {}

  /** Fire-and-forget Zoho Flow account-sync. Logs failures, never throws. */
  private syncAccountToZohoSafe(
    user: User,
    role: 'CHANNEL_PARTNER' | 'OWNER',
    extras: Record<string, unknown> = {},
  ): void {
    void this.zohoService
      .forwardAccountToFlow(
        {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role,
            createdAt: user.createdAt,
            ...extras,
          },
        },
        role,
      )
      .catch((err) => {
        this.logger.error(
          `Zoho account sync failed (${role}, user=${user.id}): ${err instanceof Error ? err.message : String(err)}`,
        );
      });
  }

  /**
   * Create JWT payload for a user
   */
  private createTokenPayload(
    userId: string,
    phone: string,
    role: UserRole,
    type: 'access_token' | 'refresh_token',
  ): JwtPayload {
    return {
      sub: userId,
      phone,
      role,
      type,
    };
  }

  /**
   * Upgrade OWNER to CHANNEL_PARTNER with code validation and history
   */
  async upgradeToChannelPartner(
    dto: UpgradeToChannelPartnerDto,
    userId: string,
  ): Promise<UpgradeToChannelPartnerResponseDto> {
    const {
      name,
      email,
      phone,
      channelPartnerCode,
      firmName,
      businessSince,
      cities,
      aboutYourSelf,
      intent,
      profilePhotoUrl,
    } = dto;

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }
    if (!user.phoneVerified) {
      throw new BadRequestException('Phone number is not verified');
    }
    if (user.role === UserRole.CHANNEL_PARTNER) {
      return { success: true, message: 'Already a CHANNEL_PARTNER' };
    }
    if (user.role !== UserRole.OWNER) {
      throw new BadRequestException('Only OWNERs can be upgraded');
    }

    const agreements = await this.agreementRepository.findByUserId(user.id);
    const hasCompletedAgreement = agreements.some(
      (agreement) => agreement.status === AgreementStatus.COMPLETED,
    );
    if (!hasCompletedAgreement) {
      throw new BadRequestException(
        'Please sign the channel partner agreement before upgrading',
      );
    }

    // Auto-generate a unique Channel Partner code on role upgrade. Client
    // wants system-generated codes; any incoming value is ignored.
    const generatedCode = await this.generateUniqueChannelPartnerCode(
      name || user.name || '',
    );

    // Use provided phone or existing user phone
    const phoneToUse = phone || user.phone;

    // Check if a CHANNEL_PARTNER with the same phone already exists
    // This prevents violating the unique constraint UQ_users_phone_role
    const existingChannelPartner = await this.userRepository.findByPhoneAndRole(
      phoneToUse,
      UserRole.CHANNEL_PARTNER,
    );
    if (existingChannelPartner && existingChannelPartner.id !== user.id) {
      throw new BadRequestException(
        'A CHANNEL_PARTNER account with this phone number already exists',
      );
    }

    // Check if email is already used by another user
    if (email) {
      const existingUserByEmail = await this.userRepository.findByEmail(email);
      if (existingUserByEmail && existingUserByEmail.id !== user.id) {
        throw new BadRequestException(
          USER_MESSAGES.USER.EMAIL_ALREADY_REGISTERED,
        );
      }
    }

    // Build update object with only provided fields
    const updateData: Partial<User> = {
      role: UserRole.CHANNEL_PARTNER,
    };

    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email || null;
    if (phone !== undefined) updateData.phone = phone;
    updateData.channelPartnerCode = generatedCode;
    if (firmName !== undefined) updateData.firmName = firmName || null;
    if (businessSince !== undefined) updateData.businessSince = businessSince || null;
    if (cities !== undefined) updateData.cities = cities || null;
    if (aboutYourSelf !== undefined) updateData.aboutYourSelf = aboutYourSelf || null;
    if (intent !== undefined) updateData.intent = intent || null;
    if (profilePhotoUrl !== undefined) updateData.profileImage = profilePhotoUrl || null;

    // Update role and persist history in a transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await queryRunner.manager.update(
        User,
        { id: user.id },
        updateData,
      );
      await this.userRoleHistoryRepository.create({
        userId: user.id,
        fromRole: UserRole.OWNER,
        toRole: UserRole.CHANNEL_PARTNER,
        channelPartnerCode: generatedCode,
      });
      await queryRunner.commitTransaction();
    } catch (e) {
      await queryRunner.rollbackTransaction();
      // Handle unique constraint violation with a user-friendly message
      if (
        e instanceof Error &&
        e.message?.includes('UQ_users_phone_role')
      ) {
        throw new BadRequestException(
          'A CHANNEL_PARTNER account with this phone number already exists',
        );
      }
      throw e;
    } finally {
      await queryRunner.release();
    }

    // Fire-and-forget: notify Zoho Flow that an Owner upgraded to Channel Partner.
    const refreshed = await this.userRepository.findById(user.id);
    if (refreshed) {
      this.syncAccountToZohoSafe(refreshed, 'CHANNEL_PARTNER', {
        channelPartnerCode: refreshed.channelPartnerCode,
        firmName: refreshed.firmName,
        businessSince: refreshed.businessSince,
        cities: refreshed.cities,
        aboutYourSelf: refreshed.aboutYourSelf,
        intent: refreshed.intent,
        upgradedFromOwner: true,
      });
    }

    return {
      success: true,
      message: 'Upgraded to CHANNEL_PARTNER successfully',
      channelPartnerCode: refreshed?.channelPartnerCode ?? generatedCode,
    };
  }

  /**
   * Generate access token for a user
   */
  private generateAccessToken(user: User): string {
    const payload = this.createTokenPayload(
      user.id,
      user.phone,
      user.role,
      'access_token',
    );
    return this.jwtService.sign(payload, {
      expiresIn: this.ACCESS_TOKEN_EXPIRY,
    });
  }

  /**
   * Generate refresh token for a user
   */
  private generateRefreshToken(user: User): string {
    const payload = this.createTokenPayload(
      user.id,
      user.phone,
      user.role,
      'refresh_token',
    );
    return this.jwtService.sign(payload, {
      expiresIn: this.REFRESH_TOKEN_EXPIRY,
    });
  }

  /**
   * Generate both access and refresh tokens for a user
   */
  private generateTokens(user: User): {
    accessToken: string;
    refreshToken: string;
  } {
    return {
      accessToken: this.generateAccessToken(user),
      refreshToken: this.generateRefreshToken(user),
    };
  }

  /**
   * Update user with new tokens in database
   */
  private async updateUserTokens(
    userId: string,
    accessToken: string,
    refreshToken: string,
  ): Promise<void> {
    await this.userRepository.update(userId, {
      token: accessToken,
      refreshToken: refreshToken,
    });
  }

  /**
   * Send OTP to phone number
   */
  async sendOtp(sendOtpDto: SendOtpDto): Promise<SendOtpResponseDto> {
    const { phone } = sendOtpDto;

    // Generate 4-digit OTP
    const otpCode = Math.floor(1000 + Math.random() * 9000).toString();

    // Set expiration time (10 minutes from now)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    // Invalidate any existing OTPs for this phone
    await this.otpRepository.deleteByPhone(phone);

    // Create new OTP record
    await this.otpRepository.create({
      phone,
      otpCode,
      expiresAt,
      isUsed: false,
      attempts: 0,
    });

    // Fan out OTP delivery: WhatsApp (Meta Cloud API), SmartPing DLT SMS,
    // and Twilio SMS/WhatsApp. allSettled so a single channel failure
    // doesn't break OTP for the user — others still deliver.
    await Promise.allSettled([
      this.metaWhatsappService.sendOtp(phone, otpCode, 10),
      this.smartpingSmsService.sendOtp(phone, otpCode, 10),
      this.twilioSmsService.sendOtp(phone, otpCode, 10),
    ]);

    // In non-production environments, also log the OTP for easier debugging
    if (process.env.NODE_ENV !== 'production') {
      this.logger.debug(`OTP generated for ${phone}: ${otpCode}`);
    }

    // Never echo the OTP back to the client. Defence-in-depth — even if
    // NODE_ENV is misconfigured on a server, the value stays out of the
    // response. Devs can read it from server logs above.
    const response: SendOtpResponseDto = {
      success: true,
      message: USER_MESSAGES.OTP.SENT,
    };

    return response;
  }

  /**
   * Send OTP for signup. ONE phone = ONE active user — if the phone is already
   * taken by any role, tell the caller to log in instead.
   */
  async sendOtpForSignup(sendOtpDto: SendOtpDto): Promise<SendOtpResponseDto> {
    const { phone, role } = sendOtpDto;
    const userRole = role || UserRole.END_USER;

    const existingUser = await this.userRepository.findByPhone(phone);
    if (existingUser) {
      throw new BadRequestException('User already exists. Please login.');
    }

    return this.sendOtp({ ...sendOtpDto, role: userRole });
  }

  /**
   * Send OTP for login. Phone must belong to any active user; their own role drives the session.
   */
  async sendOtpForLogin(sendOtpDto: SendOtpDto): Promise<SendOtpResponseDto> {
    const { phone } = sendOtpDto;

    const existingUser = await this.userRepository.findByPhone(phone);
    if (!existingUser) {
      throw new BadRequestException('User not found. Please signup first.');
    }

    if (existingUser.isBlocked) {
      throw new BadRequestException(USER_MESSAGES.USER.ACCOUNT_BLOCKED);
    }

    if (!existingUser.isActive) {
      throw new BadRequestException(USER_MESSAGES.USER.ACCOUNT_INACTIVE);
    }

    return this.sendOtp({ ...sendOtpDto, role: existingUser.role as UserRole });
  }

  /**
   * Validate OTP and create user if not exists
   * Uses database transaction to ensure atomicity
   */
  async validateOtp(
    validateOtpDto: ValidateOtpDto,
    sessionId?: string | null,
  ): Promise<ValidateOtpResponseDto> {
    const { phone, otp, role } = validateOtpDto;

    // Find the OTP record for this phone
    const otpRecord = await this.otpRepository.findActiveByPhone(phone);

    if (!otpRecord) {
      throw new BadRequestException(USER_MESSAGES.OTP.NO_VALID_OTP);
    }

    // Check if OTP has expired
    if (new Date() > otpRecord.expiresAt) {
      throw new BadRequestException(USER_MESSAGES.OTP.EXPIRED);
    }

    // Check if OTP is already used
    if (otpRecord.isUsed) {
      throw new BadRequestException(USER_MESSAGES.OTP.ALREADY_USED);
    }

    // Check if too many attempts
    if (otpRecord.attempts >= 3) {
      throw new BadRequestException(USER_MESSAGES.OTP.TOO_MANY_ATTEMPTS);
    }

    // Validate OTP code
    if (otpRecord.otpCode !== otp) {
      await this.otpRepository.incrementAttempts(otpRecord.id);
      throw new BadRequestException(USER_MESSAGES.OTP.INVALID);
    }

    // Use transaction to ensure atomicity of OTP marking and user creation/update
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Mark OTP as used within transaction
      await queryRunner.manager.update(
        'otps',
        { id: otpRecord.id },
        { isUsed: true },
      );

      // ONE phone = ONE active user. Find by phone only; the caller-supplied role is
      // only used when we have to create a brand-new row.
      const existingUser: User | null = await queryRunner.manager.findOne(User, {
        where: { phone, deletedAt: IsNull() },
      });
      const userRole: UserRole = existingUser
        ? (existingUser.role as UserRole)
        : (role ?? UserRole.OWNER);

      let user: User;
      let isNewUser = false;

      if (existingUser) {
        // Check if user is blocked
        if (existingUser.isBlocked) {
          await queryRunner.rollbackTransaction();
          throw new BadRequestException(USER_MESSAGES.USER.ACCOUNT_BLOCKED);
        }

        // Check if user is inactive
        if (!existingUser.isActive) {
          await queryRunner.rollbackTransaction();
          throw new BadRequestException(USER_MESSAGES.USER.ACCOUNT_INACTIVE);
        }

        // User exists, update phone_verified flag
        await queryRunner.manager.update(
          User,
          { id: existingUser.id },
          { phoneVerified: true },
        );
        const updatedUser = await queryRunner.manager.findOne(User, {
          where: { id: existingUser.id },
        });
        if (!updatedUser) {
          throw new BadRequestException(USER_MESSAGES.USER.FAILED_TO_UPDATE);
        }
        user = updatedUser;
      } else {
        // User doesn't exist with this phone+role combination, create new user
        if (!userRole) {
          throw new BadRequestException('Role is required for creating a new user');
        }
        
        const userData: Partial<User> = {
          phone,
          role: userRole,
          isActive: true,
          phoneVerified: true,
          name: null,
          email: null,
          intent: null,
        };

        user = queryRunner.manager.create(User, userData);
        user = await queryRunner.manager.save(user);
        isNewUser = true;
      }

      // Generate JWT tokens
      const { accessToken, refreshToken } = this.generateTokens(user);

      // Update user with tokens
      await queryRunner.manager.update(
        User,
        { id: user.id },
        { token: accessToken, refreshToken: refreshToken },
      );

      // Commit transaction
      await queryRunner.commitTransaction();

      // Merge session with user account if sessionId (from X-Session-Id header) is provided
      if (sessionId) {
        await this.propertyViewTracker.mergeSessionWithUser(
          sessionId,
          user.id,
        );
        await this.searchHistoryRepository.attachUserToSession(
          sessionId,
          user.id,
        );
        await this.contactedPropertyRepository.attachUserToSession(
          sessionId,
          user.id,
        );
      }

      // Get property count for the user
      const propertyCount = await this.propertyRepository.countByUserId(user.id);

      // Check and update KYC status
      const kycCompleted = await this.checkAndUpdateKycStatus(user.id);

      const hasReachedListingLimit =
        user.role === UserRole.OWNER
          ? propertyCount >= MAX_LISTINGS_PER_OWNER
          : false;

      return {
        success: true,
        message: isNewUser
          ? USER_MESSAGES.OTP.VALIDATED_NEW_USER(user.role)
          : USER_MESSAGES.OTP.VALIDATED,
        requiredOtherDetails: isNewUser || !user.name,
        userId: user.id,
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          isActive: user.isActive,
        },
        hasReachedListingLimit,
        propertyCount,
        kycCompleted,
      } as ValidateOtpResponseDto;
    } catch (error) {
      // Rollback transaction on error
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // Release query runner
      await queryRunner.release();
    }
  }

  /**
   * Get user by phone number
   */
  async getUserByPhone(phone: string): Promise<User | null> {
    return this.userRepository.findByPhone(phone);
  }

  /**
   * Get user by ID
   */
  async getUserById(id: string): Promise<User | null> {
    return this.userRepository.findById(id);
  }

  /**
   * Create OWNER account
   */
  async createOwner(
    createOwnerDto: CreateOwnerDto,
    tokenData: {
      sub: string;
      phone: string;
      role: UserRole;
      type: 'access_token' | 'refresh_token';
    },
  ): Promise<CreateOwnerResponseDto> {
    const { name, email, intent, city, profilePhotoUrl } = createOwnerDto;
    const { sub: userId, phone } = tokenData;

    // Find user by ID (from token) to ensure we're updating the correct user
    const existingUser = await this.userRepository.findById(userId);
    if (!existingUser) {
      throw new BadRequestException(
        USER_MESSAGES.USER.USER_NOT_FOUND_VERIFY_OTP,
      );
    }

    if (tokenData.role !== UserRole.OWNER) {
      throw new BadRequestException(USER_MESSAGES.OWNER.UNAUTHORIZED);
    }

    // Check if phone is verified
    if (!existingUser.phoneVerified) {
      throw new BadRequestException(USER_MESSAGES.USER.PHONE_NOT_VERIFIED);
    }

    // Check if email is already used by another user
    if (email) {
      const existingUserByEmail = await this.userRepository.findByEmail(email);
      if (existingUserByEmail && existingUserByEmail.id !== existingUser.id) {
        throw new BadRequestException(
          'Email address is already registered with another user.',
        );
      }
    }

    // Update user with OWNER details
    const updatedUser = await this.userRepository.update(existingUser.id, {
      name,
      email: email || null,
      role: UserRole.OWNER,
      intent: intent || null,
      cities: city || null,
      profileImage: profilePhotoUrl || null,
    });

    if (!updatedUser) {
      throw new BadRequestException(USER_MESSAGES.USER.FAILED_TO_UPDATE);
    }

    // Fire-and-forget: notify Zoho Flow that a Property Owner account was created.
    this.syncAccountToZohoSafe(updatedUser, 'OWNER', {
      city: updatedUser.cities,
      intent: updatedUser.intent,
    });

    return {
      success: true,
      message: USER_MESSAGES.OWNER.CREATED,
      userId: updatedUser.id,
      user: {
        id: updatedUser.id,
        name: updatedUser.name || '',
        email: updatedUser.email || '',
        phone: updatedUser.phone,
        role: updatedUser.role,
        isActive: updatedUser.isActive,
        city: updatedUser.cities || undefined,
      },
    };
  }

  /**
   * Create CHANNEL_PARTNER account
   */
  async createChannelPartner(
    createChannelPartnerDto: CreateChannelPartnerDto,
    tokenData: {
      sub: string;
      phone: string;
      role: UserRole;
      type: 'access_token' | 'refresh_token';
    },
  ): Promise<CreateChannelPartnerResponseDto> {
    const {
      name,
      email,
      phone,
      channelPartnerCode,
      firmName,
      businessSince,
      cities,
      aboutYourSelf,
      intent,
      profilePhotoUrl,
    } = createChannelPartnerDto;

    // Verify phone number matches token
    if (tokenData.phone !== phone) {
      throw new BadRequestException(USER_MESSAGES.USER.PHONE_NUMBER_MISMATCH);
    }

    // Find user by phone and role
    const existingUser = await this.userRepository.findByPhoneAndRole(phone, UserRole.CHANNEL_PARTNER);
    if (!existingUser) {
      throw new BadRequestException(
        USER_MESSAGES.USER.USER_NOT_FOUND_VERIFY_OTP,
      );
    }

    if (tokenData.role !== UserRole.CHANNEL_PARTNER) {
      throw new BadRequestException(USER_MESSAGES.CHANNEL_PARTNER.UNAUTHORIZED);
    }

    // Check if phone is verified
    if (!existingUser.phoneVerified) {
      throw new BadRequestException(USER_MESSAGES.USER.PHONE_NOT_VERIFIED);
    }

    // Check if email is already used by another user
    if (email) {
      const existingUserByEmail = await this.userRepository.findByEmail(email);
      if (existingUserByEmail && existingUserByEmail.id !== existingUser.id) {
        throw new BadRequestException(
          USER_MESSAGES.USER.EMAIL_ALREADY_REGISTERED,
        );
      }
    }

    // Auto-generate a unique Channel Partner code. Any code sent by the
    // client is ignored — the client wants fully system-generated codes.
    const generatedCode = await this.generateUniqueChannelPartnerCode(name);

    // Update user with CHANNEL_PARTNER details
    const updatedUser = await this.userRepository.update(existingUser.id, {
      name,
      email: email || null,
      role: UserRole.CHANNEL_PARTNER,
      channelPartnerCode: generatedCode,
      firmName: firmName || null,
      businessSince: businessSince || null,
      cities: cities || null,
      aboutYourSelf: aboutYourSelf || null,
      intent: intent || null,
      profileImage: profilePhotoUrl || null,
    });

    if (!updatedUser) {
      throw new BadRequestException(USER_MESSAGES.USER.FAILED_TO_UPDATE);
    }

    // Fire-and-forget: notify Zoho Flow that a Channel Partner account was created.
    this.syncAccountToZohoSafe(updatedUser, 'CHANNEL_PARTNER', {
      channelPartnerCode: updatedUser.channelPartnerCode,
      firmName: updatedUser.firmName,
      businessSince: updatedUser.businessSince,
      cities: updatedUser.cities,
      aboutYourSelf: updatedUser.aboutYourSelf,
      intent: updatedUser.intent,
    });

    return {
      success: true,
      message: USER_MESSAGES.CHANNEL_PARTNER.CREATED,
      userId: updatedUser.id,
      user: {
        id: updatedUser.id,
        name: updatedUser.name || '',
        email: updatedUser.email || '',
        phone: updatedUser.phone,
        role: updatedUser.role,
        isActive: updatedUser.isActive,
        channelPartnerCode: updatedUser.channelPartnerCode || null,
      },
    };
  }

  /**
   * Build a professional, unique Channel Partner code.
   *
   * Format: KMA-<NAME3>-<4DIGITS>
   *   - NAME3:  first 3 alpha chars of the user's name, uppercased.
   *             Falls back to 'CPR' if the name has fewer than 3 letters.
   *   - 4DIGITS: zero-padded integer in [0001, 9999].
   *
   * The method retries on collision (up to 20 attempts), then widens the
   * suffix to 5 digits, and finally appends a timestamp tail as a last resort
   * so registration is never blocked by a clash. The chosen code is persisted
   * into the `channel_partner_codes` master table so existing validation
   * endpoints (ValidateChannelPartnerCode, admin list) keep working.
   */
  private async generateUniqueChannelPartnerCode(name: string): Promise<string> {
    const letters = (name || '').toUpperCase().replace(/[^A-Z]/g, '');
    const prefix = (letters.slice(0, 3) || 'CPR').padEnd(3, 'X');

    const assemble = (suffix: string) => `KMA-${prefix}-${suffix}`;
    const rand = (digits: number) => {
      const min = 10 ** (digits - 1);
      const max = 10 ** digits - 1;
      return String(Math.floor(min + Math.random() * (max - min + 1)));
    };

    for (let attempt = 0; attempt < 20; attempt++) {
      const candidate = assemble(rand(4));
      const existing =
        await this.channelPartnerCodeRepository.findByCode(candidate);
      if (!existing) {
        await this.channelPartnerCodeRepository.create({ code: candidate });
        return candidate;
      }
    }
    for (let attempt = 0; attempt < 10; attempt++) {
      const candidate = assemble(rand(5));
      const existing =
        await this.channelPartnerCodeRepository.findByCode(candidate);
      if (!existing) {
        await this.channelPartnerCodeRepository.create({ code: candidate });
        return candidate;
      }
    }
    const fallback = assemble(`${rand(4)}${Date.now().toString().slice(-4)}`);
    await this.channelPartnerCodeRepository.create({ code: fallback });
    return fallback;
  }

  /**
   * Create END_USER account
   */
  async createEndUser(
    createEndUserDto: CreateEndUserDto,
    tokenData: {
      sub: string;
      phone: string;
      role: UserRole;
      type: 'access_token' | 'refresh_token';
    },
  ): Promise<CreateEndUserResponseDto> {
    const { name, email } = createEndUserDto;
    const { sub: userId, phone } = tokenData;

    // Find user by ID (from token) to ensure we're updating the correct user
    const existingUser = await this.userRepository.findById(userId);
    if (!existingUser) {
      throw new BadRequestException(USER_MESSAGES.USER.NOT_FOUND);
    }

    if (existingUser.phone !== phone) {
      throw new BadRequestException(USER_MESSAGES.USER.PHONE_NUMBER_MISMATCH);
    }

    if (tokenData.role !== UserRole.END_USER) {
      throw new BadRequestException(USER_MESSAGES.END_USER.UNAUTHORIZED);
    }

    // Check if phone is verified
    if (!existingUser.phoneVerified) {
      throw new BadRequestException(USER_MESSAGES.USER.PHONE_NOT_VERIFIED);
    }

    // Check if email is already used by another user
    if (email) {
      const existingUserByEmail = await this.userRepository.findByEmail(email);
      if (existingUserByEmail && existingUserByEmail.id !== existingUser.id) {
        throw new BadRequestException(
          USER_MESSAGES.USER.EMAIL_ALREADY_REGISTERED,
        );
      }
    }

    // Update user with END_USER details
    const updatedUser = await this.userRepository.update(existingUser.id, {
      name,
      email: email || null,
      role: UserRole.END_USER,
    });

    if (!updatedUser) {
      throw new BadRequestException(USER_MESSAGES.USER.FAILED_TO_UPDATE);
    }

    return {
      success: true,
      message: USER_MESSAGES.END_USER.CREATED,
      userId: updatedUser.id,
      user: {
        id: updatedUser.id,
        name: updatedUser.name || '',
        email: updatedUser.email || '',
        phone: updatedUser.phone,
        role: updatedUser.role,
        isActive: updatedUser.isActive,
      },
    };
  }

  /**
   * End User Signup - Send OTP
   * Takes name, email, phone and sends OTP for verification
   */
  async signupEndUser(
    signupDto: EndUserSignupDto,
  ): Promise<EndUserSignupResponseDto> {
    const { name, email, phone } = signupDto;

    // Check if user already exists with this phone and END_USER role
    const existingUser = await this.userRepository.findByPhoneAndRole(
      phone,
      UserRole.END_USER,
    );
    if (existingUser) {
      throw new BadRequestException('User already exists. Please login.');
    }

    // Check if email is already registered
    if (email) {
      const existingUserByEmail = await this.userRepository.findByEmail(email);
      if (existingUserByEmail) {
        throw new BadRequestException(
          USER_MESSAGES.USER.EMAIL_ALREADY_REGISTERED,
        );
      }
    }

    // Send OTP for signup
    const otpResponse = await this.sendOtpForSignup({
      phone,
      role: UserRole.END_USER,
    });

    return {
      success: true,
      message: 'OTP sent successfully to your mobile number',
      phone,
    };
  }

  /**
   * End User Verify OTP - Complete Signup
   * Validates OTP and creates complete END_USER account with name and email.
   * sessionId (from X-Session-Id header) is optional; when provided, merges anonymous session data with the new user.
   */
  async verifyEndUserOtp(
    verifyOtpDto: EndUserVerifyOtpDto,
    sessionId: string | null = null,
  ): Promise<EndUserVerifyOtpResponseDto> {
    const { name, email, phone, otp } = verifyOtpDto;

    // Find the OTP record for this phone
    const otpRecord = await this.otpRepository.findActiveByPhone(phone);

    if (!otpRecord) {
      throw new BadRequestException(USER_MESSAGES.OTP.NO_VALID_OTP);
    }

    // Check if OTP has expired
    if (new Date() > otpRecord.expiresAt) {
      throw new BadRequestException(USER_MESSAGES.OTP.EXPIRED);
    }

    // Check if OTP is already used
    if (otpRecord.isUsed) {
      throw new BadRequestException(USER_MESSAGES.OTP.ALREADY_USED);
    }

    // Check if too many attempts
    if (otpRecord.attempts >= 3) {
      throw new BadRequestException(USER_MESSAGES.OTP.TOO_MANY_ATTEMPTS);
    }

    // Validate OTP code
    if (otpRecord.otpCode !== otp) {
      await this.otpRepository.incrementAttempts(otpRecord.id);
      throw new BadRequestException(USER_MESSAGES.OTP.INVALID);
    }

    // Use transaction to ensure atomicity
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Mark OTP as used
      await queryRunner.manager.update(
        'otps',
        { id: otpRecord.id },
        { isUsed: true },
      );

      // Check if user already exists (should not happen, but safety check)
      const existingUser = await queryRunner.manager.findOne(User, {
        where: { phone, role: UserRole.END_USER },
      });

      if (existingUser) {
        await queryRunner.rollbackTransaction();
        throw new BadRequestException('User already exists. Please login.');
      }

      // Check if email is already registered
      if (email) {
        const existingUserByEmail = await queryRunner.manager.findOne(User, {
          where: { email },
        });
        if (existingUserByEmail) {
          await queryRunner.rollbackTransaction();
          throw new BadRequestException(
            USER_MESSAGES.USER.EMAIL_ALREADY_REGISTERED,
          );
        }
      }

      // Create new END_USER with all details
      const userData: Partial<User> = {
        phone,
        role: UserRole.END_USER,
        name,
        email,
        isActive: true,
        phoneVerified: true,
        isBlocked: false,
        intent: null,
      };

      const user = queryRunner.manager.create(User, userData);
      const savedUser = await queryRunner.manager.save(user);

      // Generate JWT tokens
      const { accessToken, refreshToken } = this.generateTokens(savedUser);

      // Update user with tokens
      await queryRunner.manager.update(
        User,
        { id: savedUser.id },
        { token: accessToken, refreshToken: refreshToken },
      );

      // Commit transaction
      await queryRunner.commitTransaction();

      // Merge session with user account if sessionId (from X-Session-Id header) is provided
      if (sessionId) {
        await this.propertyViewTracker.mergeSessionWithUser(
          sessionId,
          savedUser.id,
        );
        await this.searchHistoryRepository.attachUserToSession(
          sessionId,
          savedUser.id,
        );
        await this.contactedPropertyRepository.attachUserToSession(
          sessionId,
          savedUser.id,
        );
      }

      return {
        success: true,
        message: 'Account created successfully',
        accessToken,
        refreshToken,
        user: {
          id: savedUser.id,
          name: savedUser.name || '',
          email: savedUser.email || '',
          phone: savedUser.phone,
          role: savedUser.role,
          isActive: savedUser.isActive,
        },
      };
    } catch (error) {
      // Rollback transaction on error
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // Release query runner
      await queryRunner.release();
    }
  }

  /**
   * End User Login - Send OTP
   * Sends OTP to existing end user for login
   */
  async loginEndUser(
    loginDto: EndUserLoginDto,
  ): Promise<EndUserLoginResponseDto> {
    const { phone } = loginDto;

    // Buyer login works for any active user — END_USER, OWNER, or CHANNEL_PARTNER.
    // A seller (Owner/CP) browsing the buyer site should just get a session with
    // their existing role.
    const existingUser = await this.userRepository.findByPhone(phone);

    if (!existingUser) {
      throw new BadRequestException('User not found. Please signup first.');
    }

    if (existingUser.isBlocked) {
      throw new BadRequestException(USER_MESSAGES.USER.ACCOUNT_BLOCKED);
    }

    if (!existingUser.isActive) {
      throw new BadRequestException(USER_MESSAGES.USER.ACCOUNT_INACTIVE);
    }

    const otpResponse = await this.sendOtp({
      phone,
      role: existingUser.role as UserRole,
    });

    return {
      success: true,
      message: 'OTP sent successfully to your mobile number',
      phone,
    };
  }

  /**
   * End User Verify Login OTP
   * Validates OTP and logs in the end user.
   * sessionId (from X-Session-Id header) is optional; when provided, merges anonymous session data with the user.
   */
  async verifyEndUserLoginOtp(
    verifyOtpDto: EndUserVerifyLoginOtpDto,
    sessionId: string | null = null,
  ): Promise<EndUserVerifyLoginOtpResponseDto> {
    const { phone, otp } = verifyOtpDto;

    // Find the OTP record for this phone
    const otpRecord = await this.otpRepository.findActiveByPhone(phone);

    if (!otpRecord) {
      throw new BadRequestException(USER_MESSAGES.OTP.NO_VALID_OTP);
    }

    // Check if OTP has expired
    if (new Date() > otpRecord.expiresAt) {
      throw new BadRequestException(USER_MESSAGES.OTP.EXPIRED);
    }

    // Check if OTP is already used
    if (otpRecord.isUsed) {
      throw new BadRequestException(USER_MESSAGES.OTP.ALREADY_USED);
    }

    // Check if too many attempts
    if (otpRecord.attempts >= 3) {
      throw new BadRequestException(USER_MESSAGES.OTP.TOO_MANY_ATTEMPTS);
    }

    // Validate OTP code
    if (otpRecord.otpCode !== otp) {
      await this.otpRepository.incrementAttempts(otpRecord.id);
      throw new BadRequestException(USER_MESSAGES.OTP.INVALID);
    }

    // Use transaction to ensure atomicity
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Mark OTP as used
      await queryRunner.manager.update(
        'otps',
        { id: otpRecord.id },
        { isUsed: true },
      );

      // Find user by phone (role-agnostic). Buyer verify-login works for any
      // active user; their stored role is what the session will carry.
      const user = await queryRunner.manager.findOne(User, {
        where: { phone, deletedAt: IsNull() },
      });

      if (!user) {
        await queryRunner.rollbackTransaction();
        throw new BadRequestException(USER_MESSAGES.USER.NOT_FOUND);
      }

      // Check if user is blocked
      if (user.isBlocked) {
        await queryRunner.rollbackTransaction();
        throw new BadRequestException(USER_MESSAGES.USER.ACCOUNT_BLOCKED);
      }

      // Check if user is inactive
      if (!user.isActive) {
        await queryRunner.rollbackTransaction();
        throw new BadRequestException(USER_MESSAGES.USER.ACCOUNT_INACTIVE);
      }

      // Update phone verified flag
      await queryRunner.manager.update(
        User,
        { id: user.id },
        { phoneVerified: true },
      );

      const updatedUser = await queryRunner.manager.findOne(User, {
        where: { id: user.id },
      });

      if (!updatedUser) {
        throw new BadRequestException(USER_MESSAGES.USER.FAILED_TO_UPDATE);
      }

      // Generate JWT tokens
      const { accessToken, refreshToken } = this.generateTokens(updatedUser);

      // Update user with tokens
      await queryRunner.manager.update(
        User,
        { id: updatedUser.id },
        { token: accessToken, refreshToken: refreshToken },
      );

      // Commit transaction
      await queryRunner.commitTransaction();

      // Merge session with user account if sessionId (from X-Session-Id header) is provided
      if (sessionId) {
        await this.propertyViewTracker.mergeSessionWithUser(
          sessionId,
          updatedUser.id,
        );
        await this.searchHistoryRepository.attachUserToSession(
          sessionId,
          updatedUser.id,
        );
        await this.contactedPropertyRepository.attachUserToSession(
          sessionId,
          updatedUser.id,
        );
      }

      return {
        success: true,
        message: 'Login successful',
        accessToken,
        refreshToken,
        user: {
          id: updatedUser.id,
          name: updatedUser.name || '',
          email: updatedUser.email || '',
          phone: updatedUser.phone,
          role: updatedUser.role,
          isActive: updatedUser.isActive,
        },
      };
    } catch (error) {
      // Rollback transaction on error
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // Release query runner
      await queryRunner.release();
    }
  }

  /**
   * Resend OTP to phone number
   */
  async resendOtp(resendOtpDto: ResendOtpDto): Promise<ResendOtpResponseDto> {
    const { phone } = resendOtpDto;

    // Generate 4-digit OTP
    const otpCode = Math.floor(1000 + Math.random() * 9000).toString();

    // Set expiration time (10 minutes from now)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    // Invalidate any existing OTPs for this phone
    await this.otpRepository.deleteByPhone(phone);

    // Create new OTP record
    await this.otpRepository.create({
      phone,
      otpCode,
      expiresAt,
      isUsed: false,
      attempts: 0,
    });

    // In production, integrate with SMS service

    // For development, log the OTP (only in non-production)
    if (process.env.NODE_ENV !== 'production') {
      this.logger.debug(`OTP resent for ${phone}: ${otpCode}`);
    }

    // Never return the OTP in the response — see sendOtp for the reasoning.
    const response: ResendOtpResponseDto = {
      success: true,
      message: USER_MESSAGES.OTP.RESENT,
    };

    return response;
  }

  /**
   * Get list of supported cities
   */
  getCities(): string[] {
    return ['Delhi', 'Noida', 'Gurugram'];
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(
    refreshTokenDto: RefreshTokenDto,
  ): Promise<RefreshTokenResponseDto> {
    const { refreshToken } = refreshTokenDto;

    try {
      // Verify refresh token with proper typing
      const decodedToken =
        this.jwtService.verify<RefreshTokenPayload>(refreshToken);

      if (decodedToken.type !== 'refresh_token') {
        throw new BadRequestException(USER_MESSAGES.AUTH.INVALID_TOKEN_TYPE);
      }

      // Find user by ID
      const user = await this.userRepository.findById(decodedToken.sub);
      if (!user) {
        throw new BadRequestException(USER_MESSAGES.USER.NOT_FOUND);
      }

      // Check if the refresh token matches the one stored in database
      if (user.refreshToken !== refreshToken) {
        throw new BadRequestException(USER_MESSAGES.AUTH.INVALID_REFRESH_TOKEN);
      }

      // Generate new tokens
      const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
        this.generateTokens(user);

      // Update user with new tokens
      await this.updateUserTokens(user.id, newAccessToken, newRefreshToken);

      return {
        success: true,
        message: USER_MESSAGES.AUTH.TOKEN_REFRESHED,
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'TokenExpiredError') {
        throw new BadRequestException(USER_MESSAGES.AUTH.TOKEN_EXPIRED);
      } else if (error instanceof Error && error.name === 'JsonWebTokenError') {
        throw new BadRequestException(USER_MESSAGES.AUTH.INVALID_REFRESH_TOKEN);
      } else {
        throw new BadRequestException(USER_MESSAGES.AUTH.TOKEN_REFRESH_FAILED);
      }
    }
  }

  /**
   * Logout user and clear tokens
   */
  async logout(userId: string): Promise<LogoutResponseDto> {
    await this.clearUserTokens(userId);
    return {
      success: true,
      message: USER_MESSAGES.AUTH.LOGOUT_SUCCESSFUL,
    };
  }

  /**
   * Clear user tokens from database
   */
  private async clearUserTokens(userId: string): Promise<void> {
    await this.userRepository.update(userId, {
      token: null,
      refreshToken: null,
    });
  }

  /**
   * Build seller/channel partner dashboard data
   */
  async getDashboard(userId: string): Promise<DashboardResponseDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }
    const used = await this.propertyRepository.countByUserId(user.id);
    const isChannelPartner = user.role === UserRole.CHANNEL_PARTNER;
    const total = isChannelPartner ? null : MAX_LISTINGS_PER_OWNER;
    const remaining = isChannelPartner ? null : Math.max(0, (total as number) - used);
    const daySince = new Date();
    daySince.setDate(daySince.getDate() - 1);
    const weekSince = new Date();
    weekSince.setDate(weekSince.getDate() - 7);
    const monthSince = new Date();
    monthSince.setDate(monthSince.getDate() - 30);

    const [
      dayResidential,
      dayCommercial,
      weekResidential,
      weekCommercial,
      monthResidential,
      monthCommercial,
    ] = await Promise.all([
      this.leadRepository.countByUserAndTypeSinceQuery(user.id, LeadType.RESIDENTIAL, daySince),
      this.leadRepository.countByUserAndTypeSinceQuery(user.id, LeadType.COMMERCIAL, daySince),
      this.leadRepository.countByUserAndTypeSinceQuery(user.id, LeadType.RESIDENTIAL, weekSince),
      this.leadRepository.countByUserAndTypeSinceQuery(user.id, LeadType.COMMERCIAL, weekSince),
      this.leadRepository.countByUserAndTypeSinceQuery(user.id, LeadType.RESIDENTIAL, monthSince),
      this.leadRepository.countByUserAndTypeSinceQuery(user.id, LeadType.COMMERCIAL, monthSince),
    ]);

    // Get category IDs for residential and commercial
    const residentialCategory = await this.propertyCategoryRepository.findByCode('residential');
    const commercialCategory = await this.propertyCategoryRepository.findByCode('commercial');

    // Count properties by category for the user
    const [
      residentialCount,
      commercialCount,
    ] = await Promise.all([
      residentialCategory
        ? this.propertyRepository.countByUserIdAndCategoryId(
            user.id,
            residentialCategory.id,
          )
        : Promise.resolve(0),
      commercialCategory
        ? this.propertyRepository.countByUserIdAndCategoryId(
            user.id,
            commercialCategory.id,
          )
        : Promise.resolve(0),
    ]);

    // Get KYC status
    const kycStatus = await this.getVerificationStepsStatus(userId);

    return {
      name: user.name ?? null,
      role: user.role,
      plan: isChannelPartner ? 'CHANNEL_PARTNER' : 'FREE',
      freeListings: {
        used,
        total,
        remaining,
        isUnlimited: isChannelPartner,
      },
      leadsSummary: {
        lastDay: {
          residential: dayResidential,
          commercial: dayCommercial,
        },
        lastWeek: {
          residential: weekResidential,
          commercial: weekCommercial,
        },
        lastMonth: {
          residential: monthResidential,
          commercial: monthCommercial,
        },
      },
      listingsSummary: {
        residential: residentialCount,
        commercial: commercialCount,
      },
      kycStatus: {
        step1_live_photo: kycStatus.step1_live_photo,
        step2_aadhaar: kycStatus.step2_aadhaar,
        step3_bank_details: kycStatus.step3_bank_details,
        step4_docusign_agreement: kycStatus.step4_docusign_agreement,
        kyc_completed: kycStatus.kyc_completed,
        kyc_progress: kycStatus.kyc_progress,
        kyc_steps_completed: kycStatus.kyc_steps_completed,
        kyc_total_steps: kycStatus.kyc_total_steps,
        kyc_status: kycStatus.kyc_status,
      },
    };
  }

  /**
   * Get End User Profile
   */
  async getEndUserProfile(userId: string): Promise<EndUserProfileResponseDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new BadRequestException(USER_MESSAGES.USER.NOT_FOUND);
    }

    return {
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive,
        phoneVerified: user.phoneVerified,
        profileImage: user.profileImage,
      },
    };
  }

  /**
   * Edit End User Profile (Name and Email)
   */
  async editEndUserProfile(
    userId: string,
    editProfileDto: EndUserEditProfileDto,
  ): Promise<EndUserEditProfileResponseDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new BadRequestException(USER_MESSAGES.USER.NOT_FOUND);
    }

    const updateData: Partial<User> = {};

    if (editProfileDto.name !== undefined) {
      updateData.name = editProfileDto.name || null;
    }

    if (editProfileDto.email !== undefined) {
      // Check if email is already used by another user
      if (editProfileDto.email) {
        const existingUserByEmail = await this.userRepository.findByEmail(
          editProfileDto.email,
        );
        if (existingUserByEmail && existingUserByEmail.id !== userId) {
          throw new BadRequestException(
            USER_MESSAGES.USER.EMAIL_ALREADY_REGISTERED,
          );
        }
      }
      updateData.email = editProfileDto.email || null;
    }

    if (editProfileDto.profileImage !== undefined) {
      updateData.profileImage = editProfileDto.profileImage || null;
    }

    const updatedUser = await this.userRepository.update(userId, updateData);
    if (!updatedUser) {
      throw new BadRequestException(USER_MESSAGES.USER.FAILED_TO_UPDATE);
    }

    return {
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        isActive: updatedUser.isActive,
        profileImage: updatedUser.profileImage,
      },
    };
  }

  /**
   * Get User Profile (Owner or Channel Partner)
   */
  async getUserProfile(userId: string): Promise<UserProfileResponseDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new BadRequestException(USER_MESSAGES.USER.NOT_FOUND);
    }

    // Works for any role now. Fields only meaningful for one role are blanked
    // out for the others so the shared buyer/seller Edit Profile UI can bind
    // to the same payload regardless of who is logged in.
    return {
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive,
        phoneVerified: user.phoneVerified,
        city:
          user.role === UserRole.OWNER || user.role === UserRole.END_USER
            ? user.cities
            : null,
        channelPartnerCode: user.role === UserRole.CHANNEL_PARTNER ? user.channelPartnerCode : null,
        firmName: user.role === UserRole.CHANNEL_PARTNER ? user.firmName : null,
        businessSince: user.role === UserRole.CHANNEL_PARTNER ? user.businessSince : null,
        cities: user.role === UserRole.CHANNEL_PARTNER ? user.cities : null,
        aboutYourSelf: user.role === UserRole.CHANNEL_PARTNER ? user.aboutYourSelf : null,
        profileImage: user.profileImage,
      },
    };
  }

  /**
   * Get Owner Profile
   */
  async getOwnerProfile(userId: string): Promise<OwnerProfileResponseDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new BadRequestException(USER_MESSAGES.USER.NOT_FOUND);
    }

    if (user.role !== UserRole.OWNER) {
      throw new BadRequestException('User is not an owner');
    }

    return {
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive,
        phoneVerified: user.phoneVerified,
        intent: user.intent,
        city: user.cities,
        profileImage: user.profileImage,
      },
    };
  }

  /**
   * Edit Owner Profile
   */
  async editOwnerProfile(
    userId: string,
    editProfileDto: OwnerEditProfileDto,
  ): Promise<OwnerEditProfileResponseDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new BadRequestException(USER_MESSAGES.USER.NOT_FOUND);
    }

    if (user.role !== UserRole.OWNER) {
      throw new BadRequestException('User is not an owner');
    }

    const updateData: Partial<User> = {};

    if (editProfileDto.name !== undefined) {
      updateData.name = editProfileDto.name || null;
    }

    if (editProfileDto.email !== undefined) {
      // Check if email is already used by another user
      if (editProfileDto.email) {
        const existingUserByEmail = await this.userRepository.findByEmail(
          editProfileDto.email,
        );
        if (existingUserByEmail && existingUserByEmail.id !== userId) {
          throw new BadRequestException(
            USER_MESSAGES.USER.EMAIL_ALREADY_REGISTERED,
          );
        }
      }
      updateData.email = editProfileDto.email || null;
    }

    if (editProfileDto.intent !== undefined) {
      updateData.intent = editProfileDto.intent || null;
    }

    if (editProfileDto.city !== undefined) {
      updateData.cities = editProfileDto.city || null;
    }

    if (editProfileDto.profileImage !== undefined) {
      updateData.profileImage = editProfileDto.profileImage || null;
    }

    const updatedUser = await this.userRepository.update(userId, updateData);
    if (!updatedUser) {
      throw new BadRequestException(USER_MESSAGES.USER.FAILED_TO_UPDATE);
    }

    return {
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        isActive: updatedUser.isActive,
        intent: updatedUser.intent,
        city: updatedUser.cities,
        profileImage: updatedUser.profileImage,
      },
    };
  }

  /**
   * Get Channel Partner Profile
   */
  async getChannelPartnerProfile(
    userId: string,
  ): Promise<ChannelPartnerProfileResponseDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new BadRequestException(USER_MESSAGES.USER.NOT_FOUND);
    }

    if (user.role !== UserRole.CHANNEL_PARTNER) {
      throw new BadRequestException('User is not a channel partner');
    }

    return {
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive,
        phoneVerified: user.phoneVerified,
        channelPartnerCode: user.channelPartnerCode,
        firmName: user.firmName,
        businessSince: user.businessSince,
        cities: user.cities,
        aboutYourSelf: user.aboutYourSelf,
        intent: user.intent,
        profileImage: user.profileImage,
      },
    };
  }

  /**
   * Edit User Profile (Owner or Channel Partner)
   */
  async editUserProfile(
    userId: string,
    editProfileDto: UserEditProfileDto,
  ): Promise<UserEditProfileResponseDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new BadRequestException(USER_MESSAGES.USER.NOT_FOUND);
    }

    const updateData: Partial<User> = {};

    if (editProfileDto.name !== undefined) {
      updateData.name = editProfileDto.name || null;
    }

    if (editProfileDto.email !== undefined) {
      // Check if email is already used by another user
      if (editProfileDto.email) {
        const existingUserByEmail = await this.userRepository.findByEmail(
          editProfileDto.email,
        );
        if (existingUserByEmail && existingUserByEmail.id !== userId) {
          throw new BadRequestException(
            USER_MESSAGES.USER.EMAIL_ALREADY_REGISTERED,
          );
        }
      }
      updateData.email = editProfileDto.email || null;
    }

    if (editProfileDto.profileImage !== undefined) {
      updateData.profileImage = editProfileDto.profileImage || null;
    }

    // End-user and Owner both use `cities` for their single-city field.
    if (user.role === UserRole.OWNER || user.role === UserRole.END_USER) {
      if (editProfileDto.city !== undefined) {
        updateData.cities = editProfileDto.city || null;
      }
    }

    // Channel Partner-specific fields
    if (user.role === UserRole.CHANNEL_PARTNER) {
      if (editProfileDto.channelPartnerCode !== undefined) {
        // Validate channel partner code if provided
        if (editProfileDto.channelPartnerCode) {
          const validCode =
            await this.channelPartnerCodeRepository.findByCode(
              editProfileDto.channelPartnerCode,
            );
          if (!validCode) {
            throw new BadRequestException(
              USER_MESSAGES.CHANNEL_PARTNER.INVALID_CODE,
            );
          }
        }
        updateData.channelPartnerCode =
          editProfileDto.channelPartnerCode || null;
      }

      if (editProfileDto.firmName !== undefined) {
        updateData.firmName = editProfileDto.firmName || null;
      }

      if (editProfileDto.businessSince !== undefined) {
        updateData.businessSince = editProfileDto.businessSince || null;
      }

      if (editProfileDto.cities !== undefined) {
        updateData.cities = editProfileDto.cities || null;
      }

      if (editProfileDto.aboutYourSelf !== undefined) {
        updateData.aboutYourSelf = editProfileDto.aboutYourSelf || null;
      }
    }

    const updatedUser = await this.userRepository.update(userId, updateData);
    if (!updatedUser) {
      throw new BadRequestException(USER_MESSAGES.USER.FAILED_TO_UPDATE);
    }

    return {
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        isActive: updatedUser.isActive,
        city: updatedUser.role === UserRole.OWNER ? updatedUser.cities : null,
        channelPartnerCode: updatedUser.role === UserRole.CHANNEL_PARTNER ? updatedUser.channelPartnerCode : null,
        firmName: updatedUser.role === UserRole.CHANNEL_PARTNER ? updatedUser.firmName : null,
        businessSince: updatedUser.role === UserRole.CHANNEL_PARTNER ? updatedUser.businessSince : null,
        cities: updatedUser.role === UserRole.CHANNEL_PARTNER ? updatedUser.cities : null,
        aboutYourSelf: updatedUser.role === UserRole.CHANNEL_PARTNER ? updatedUser.aboutYourSelf : null,
        profileImage: updatedUser.profileImage,
      },
    };
  }

  /**
   * Edit Channel Partner Profile
   */
  async editChannelPartnerProfile(
    userId: string,
    editProfileDto: ChannelPartnerEditProfileDto,
  ): Promise<ChannelPartnerEditProfileResponseDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new BadRequestException(USER_MESSAGES.USER.NOT_FOUND);
    }

    if (user.role !== UserRole.CHANNEL_PARTNER) {
      throw new BadRequestException('User is not a channel partner');
    }

    const updateData: Partial<User> = {};

    if (editProfileDto.name !== undefined) {
      updateData.name = editProfileDto.name || null;
    }

    if (editProfileDto.email !== undefined) {
      // Check if email is already used by another user
      if (editProfileDto.email) {
        const existingUserByEmail = await this.userRepository.findByEmail(
          editProfileDto.email,
        );
        if (existingUserByEmail && existingUserByEmail.id !== userId) {
          throw new BadRequestException(
            USER_MESSAGES.USER.EMAIL_ALREADY_REGISTERED,
          );
        }
      }
      updateData.email = editProfileDto.email || null;
    }

    if (editProfileDto.channelPartnerCode !== undefined) {
      // Validate channel partner code if provided
      if (editProfileDto.channelPartnerCode) {
        const validCode =
          await this.channelPartnerCodeRepository.findByCode(
            editProfileDto.channelPartnerCode,
          );
        if (!validCode) {
          throw new BadRequestException(
            USER_MESSAGES.CHANNEL_PARTNER.INVALID_CODE,
          );
        }
      }
      updateData.channelPartnerCode =
        editProfileDto.channelPartnerCode || null;
    }

    if (editProfileDto.firmName !== undefined) {
      updateData.firmName = editProfileDto.firmName || null;
    }

    if (editProfileDto.businessSince !== undefined) {
      updateData.businessSince = editProfileDto.businessSince || null;
    }

    if (editProfileDto.cities !== undefined) {
      updateData.cities = editProfileDto.cities || null;
    }

    if (editProfileDto.aboutYourSelf !== undefined) {
      updateData.aboutYourSelf = editProfileDto.aboutYourSelf || null;
    }

    if (editProfileDto.intent !== undefined) {
      updateData.intent = editProfileDto.intent || null;
    }

    if (editProfileDto.profileImage !== undefined) {
      updateData.profileImage = editProfileDto.profileImage || null;
    }

    const updatedUser = await this.userRepository.update(userId, updateData);
    if (!updatedUser) {
      throw new BadRequestException(USER_MESSAGES.USER.FAILED_TO_UPDATE);
    }

    return {
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        isActive: updatedUser.isActive,
        channelPartnerCode: updatedUser.channelPartnerCode,
        firmName: updatedUser.firmName,
        businessSince: updatedUser.businessSince,
        cities: updatedUser.cities,
        aboutYourSelf: updatedUser.aboutYourSelf,
        intent: updatedUser.intent,
        profileImage: updatedUser.profileImage,
      },
    };
  }

  /**
   * Change Mobile Number - Send OTP
   */
  async changeEndUserMobile(
    userId: string,
    changeMobileDto: EndUserChangeMobileDto,
  ): Promise<EndUserChangeMobileResponseDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new BadRequestException(USER_MESSAGES.USER.NOT_FOUND);
    }

    if (user.role !== UserRole.END_USER) {
      throw new BadRequestException('User is not an end user');
    }

    const { phone: newPhone } = changeMobileDto;

    // Check if new phone is same as current phone
    if (user.phone === newPhone) {
      throw new BadRequestException(
        'New mobile number is the same as current mobile number',
      );
    }

    // Check if new phone is already registered
    const existingUser = await this.userRepository.findByPhoneAndRole(
      newPhone,
      UserRole.END_USER,
    );
    if (existingUser) {
      throw new BadRequestException(
        'This mobile number is already registered with another account',
      );
    }

    // Send OTP to new phone number
    const otpResponse = await this.sendOtp({
      phone: newPhone,
      role: UserRole.END_USER,
    });

    return {
      success: true,
      message: 'OTP sent successfully to your new mobile number',
      phone: newPhone,
    };
  }

  /**
   * Verify OTP and Change Mobile Number
   */
  async verifyChangeEndUserMobile(
    userId: string,
    verifyOtpDto: EndUserVerifyChangeMobileOtpDto,
  ): Promise<EndUserVerifyChangeMobileOtpResponseDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new BadRequestException(USER_MESSAGES.USER.NOT_FOUND);
    }

    if (user.role !== UserRole.END_USER) {
      throw new BadRequestException('User is not an end user');
    }

    const { phone: newPhone, otp } = verifyOtpDto;

    // Find the OTP record for the new phone
    const otpRecord = await this.otpRepository.findActiveByPhone(newPhone);

    if (!otpRecord) {
      throw new BadRequestException(USER_MESSAGES.OTP.NO_VALID_OTP);
    }

    // Check if OTP has expired
    if (new Date() > otpRecord.expiresAt) {
      throw new BadRequestException(USER_MESSAGES.OTP.EXPIRED);
    }

    // Check if OTP is already used
    if (otpRecord.isUsed) {
      throw new BadRequestException(USER_MESSAGES.OTP.ALREADY_USED);
    }

    // Check if too many attempts
    if (otpRecord.attempts >= 3) {
      throw new BadRequestException(USER_MESSAGES.OTP.TOO_MANY_ATTEMPTS);
    }

    // Validate OTP code
    if (otpRecord.otpCode !== otp) {
      await this.otpRepository.incrementAttempts(otpRecord.id);
      throw new BadRequestException(USER_MESSAGES.OTP.INVALID);
    }

    // Use transaction to ensure atomicity
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Mark OTP as used
      await queryRunner.manager.update(
        'otps',
        { id: otpRecord.id },
        { isUsed: true },
      );

      // Check if new phone is already registered (double check)
      const existingUser = await queryRunner.manager.findOne(User, {
        where: { phone: newPhone, role: UserRole.END_USER },
      });

      if (existingUser && existingUser.id !== userId) {
        await queryRunner.rollbackTransaction();
        throw new BadRequestException(
          'This mobile number is already registered with another account',
        );
      }

      // Update user's phone number and mark as verified
      await queryRunner.manager.update(
        User,
        { id: userId },
        { phone: newPhone, phoneVerified: true },
      );

      const updatedUser = await queryRunner.manager.findOne(User, {
        where: { id: userId },
      });

      if (!updatedUser) {
        throw new BadRequestException(USER_MESSAGES.USER.FAILED_TO_UPDATE);
      }

      // Commit transaction
      await queryRunner.commitTransaction();

      return {
        success: true,
        message: 'Mobile number changed successfully',
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          phone: updatedUser.phone,
          role: updatedUser.role,
          isActive: updatedUser.isActive,
        },
      };
    } catch (error) {
      // Rollback transaction on error
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // Release query runner
      await queryRunner.release();
    }
  }

  /**
   * Get all distinct states
   */
  async getStates(): Promise<string[]> {
    return await this.cityRepository.findDistinctStates();
  }

  /**
   * Get cities by state name
   */
  async getCitiesByState(state: string) {
    return await this.cityRepository.findByState(state);
  }

  /**
   * Get End User Home Page Data
   * Returns featured cities and all cities list with search and location detection
   */
  async getEndUserHomePage(
    query?: EndUserCitiesQueryDto,
  ): Promise<EndUserHomePageResponseDto> {
    const { search, latitude, longitude } = query || {};

    // Map cities to DTO format
    const mapCityToDto = (city: any): CityItemDto => ({
      id: city.id,
      name: city.name,
      code: city.code,
      state: city.state,
      latitude: city.latitude ? parseFloat(city.latitude.toString()) : null,
      longitude: city.longitude ? parseFloat(city.longitude.toString()) : null,
      icon: city.icon ?? null,
    });

    // Get featured cities from database
    const featuredCitiesFromDb = await this.cityRepository.findFeatured();
    let featuredCities = featuredCitiesFromDb.map(mapCityToDto);

    // Get all cities from database
    const allCitiesFromDb = await this.cityRepository.findAll();
    let allCities = allCitiesFromDb.map(mapCityToDto);

    // Filter both featuredCities and allCities based on search query (if provided)
    if (search && search.trim()) {
      const searchQuery = search.trim().toLowerCase();
      featuredCities = featuredCities.filter((city) =>
        city.name.toLowerCase().includes(searchQuery),
      );
      allCities = allCities.filter((city) =>
        city.name.toLowerCase().includes(searchQuery),
      );
    }
    // If search is empty, both arrays already contain all cities

    // Detect city based on latitude/longitude (only for location detection)
    let detectedCity: CityItemDto | null = null;
    if (latitude !== undefined && longitude !== undefined) {
      const allCitiesForDetection = await this.cityRepository.findAll();

      // Find the nearest city using Haversine formula
      let minDistance = Infinity;
      let nearestCity: any = null;

      for (const city of allCitiesForDetection) {
        if (city.latitude && city.longitude) {
          const cityLat = parseFloat(city.latitude.toString());
          const cityLon = parseFloat(city.longitude.toString());

          // Haversine formula to calculate distance
          const R = 6371; // Earth's radius in km
          const dLat = this.deg2rad(cityLat - latitude);
          const dLon = this.deg2rad(cityLon - longitude);
          const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.deg2rad(latitude)) *
              Math.cos(this.deg2rad(cityLat)) *
              Math.sin(dLon / 2) *
              Math.sin(dLon / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          const distance = R * c; // Distance in km

          if (distance < minDistance) {
            minDistance = distance;
            nearestCity = city;
          }
        }
      }

      // Only return detected city if it's within reasonable distance (e.g., 50km)
      if (nearestCity && minDistance <= 50) {
        detectedCity = mapCityToDto(nearestCity);
      }
    }

    return {
      success: true,
      featuredCities,
      allCities,
      detectedCity,
    };
  }

  /**
   * Convert degrees to radians
   */
  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  /**
   * Search properties for end users
   * Returns paginated list of active properties with filters
   * @param query - Search query parameters
   * @param userId - Optional user ID to check favorite status (if logged in)
   */
  async searchEndUserProperties(
    query: EndUserPropertiesSearchQueryDto,
    userId?: string,
  ): Promise<EndUserPropertiesSearchResponseDto> {
    // Anonymous (no userId) hits a 60s cache. Logged-in callers always go to
    // DB so per-user `isFavorite` flags stay accurate.
    if (!userId) {
      const cacheKey = `properties:list:${this.stableQueryHash(query)}`;
      return this.cache.getOrSet(cacheKey, 60_000, () =>
        this.runEndUserPropertiesSearch(query, undefined),
      );
    }
    return this.runEndUserPropertiesSearch(query, userId);
  }

  private stableQueryHash(query: EndUserPropertiesSearchQueryDto): string {
    const source = query as unknown as Record<string, unknown>;
    const ordered: Record<string, unknown> = {};
    Object.keys(source)
      .sort()
      .forEach((k) => {
        const v = source[k];
        if (v !== undefined && v !== null && v !== '') ordered[k] = v;
      });
    return JSON.stringify(ordered);
  }

  private async runEndUserPropertiesSearch(
    query: EndUserPropertiesSearchQueryDto,
    userId?: string,
  ): Promise<EndUserPropertiesSearchResponseDto> {
    const {
      page,
      limit,
      sortBy,
      sortOrder,
      cityId,
      search,
      categoryIds,
      listingTypeIds,
      propertyTypeIds,
      bhkTypeIds,
      furnishingTypes,
      constructionStatuses,
      minPrice,
      maxPrice,
      latitude,
      longitude,
      radius,
      minSize,
      maxSize,
      amenityIds,
      postedBy,
    } = query;

    const result = await this.propertyRepository.findEndUserProperties({
      page,
      limit,
      sortBy,
      sortOrder,
      filters: {
        cityId,
        search,
        categoryIds,
        listingTypeIds,
        propertyTypeIds,
        bhkTypeIds,
        furnishingTypes,
        constructionStatuses,
        minPrice,
        maxPrice,
        latitude,
        longitude,
        radius,
        minSize,
        maxSize,
        amenityIds,
        postedBy,
      },
    });

    // Get favorite property IDs if user is logged in
    let favoritePropertyIds: Set<string> = new Set();
    if (userId) {
      const favoriteProperties = await this.favoritePropertyRepository
        .findByUserId(userId, 1, 10000); // Get all favorites (large limit to get all)
      favoritePropertyIds = new Set(
        favoriteProperties.items.map((fp) => fp.propertyId),
      );
    }

    // Map properties to response DTO
    const properties: EndUserPropertyListItemDto[] = result.items.map(
      (property) => {
        // Filter to only approved media, then get primary image and all images
        const approvedPhotos = this.filterApprovedPhotos(property.photos);
        const approvedVideos = this.filterApprovedVideos(property.videos);
        let imageUrl: string | null = null;
        let images: EndUserPropertyImageDto[] | undefined = undefined;
        if (approvedPhotos.length > 0) {
          const coverImage = approvedPhotos.find((p) => p.isCoverImage);
          const firstPhoto = approvedPhotos[0];
          const selectedPhoto = coverImage || firstPhoto;
          imageUrl = selectedPhoto.fileKey ? this.s3Service.generateFileUrl(selectedPhoto.fileKey) : null;

          // Map all approved images
          images = approvedPhotos.map((photo) => ({
            fileKey: photo.fileKey,
            url: photo.fileKey ? this.s3Service.generateFileUrl(photo.fileKey) : null,
            view: photo.view,
            isCoverImage: photo.isCoverImage || false,
          }));
        }

        // Map all approved videos
        let videos: EndUserPropertyVideoDto[] | undefined = undefined;
        if (approvedVideos.length > 0) {
          videos = approvedVideos.map((video) => ({
            fileKey: video.fileKey,
            url: video.fileKey ? this.s3Service.generateFileUrl(video.fileKey) : null,
            format: video.format,
          }));
        }

        // Build address
        const addressParts: string[] = [];
        if (property.society?.name) {
          addressParts.push(property.society.name);
        }
        if (property.locality?.name) {
          addressParts.push(property.locality.name);
        }
        if (property.city?.name) {
          addressParts.push(property.city.name);
        }
        const address = addressParts.join(', ') || 'Address not available';

        // Build property name (use society name or property description)
        const propertyName =
          property.society?.name ||
          property.propertyDescription?.split('.')[0] ||
          'Property';

        // Build units array (simplified - you may want to enhance this)
        const units: EndUserPropertyUnitDto[] = [];
        if (property.bhkType?.name && property.builtUpAreaMetadata) {
          const superBuiltUpArea = property.builtUpAreaMetadata.superBuiltUpArea
            ? `${property.builtUpAreaMetadata.superBuiltUpArea} Sq. Ft.`
            : property.builtUpAreaMetadata.carpetArea
              ? `${property.builtUpAreaMetadata.carpetArea} Sq. Ft.`
              : 'Size not available';
          const price =
            property.price != null
              ? `₹ ${property.price.toLocaleString('en-IN')}`
              : property.monthlyRent != null
                ? `₹ ${property.monthlyRent.toLocaleString('en-IN')}/month`
                : 'Price On Request';

          units.push({
            unit: property.bhkType.name,
            size: `${superBuiltUpArea} (Saleable)`,
            price,
          });
        }

        return {
          id: property.id,
          propertyName,
          address,
          description: property.propertyDescription || undefined,
          imageUrl,
          images: images,
          videos: videos,
          imageCount: approvedPhotos.length,
          videoCount: approvedVideos.length,
          isReraRegistered: false, // Add RERA field to Property entity if needed
          constructionStatus: property.constructionStatus || null,
          categoryId: property.category?.id ?? null,
          category: property.category?.name || null,
          listingTypeId: property.listingType?.id ?? null,
          listingType: property.listingType?.name || null,
          propertyTypeId: property.propertyType?.id ?? null,
          propertyType: property.propertyType?.name || null,
          bhkTypeId: property.bhkType?.id ?? null,
          bhkType: property.bhkType?.name || null,
          plotArea: property.plotArea || null,
          plotAreaUnit: property.plotAreaUnit || null,
          facing: property.facing || null,
          furnishType: property.furnishType || null,
          price: property.price || null,
          monthlyRent: property.monthlyRent || null,
          city: property.city?.name || null,
          state: property.city?.state || null,
          society: property.society?.name || null,
          locality: property.locality?.name || null,
          units: units.length > 0 ? units : undefined,
          owner: property.user
            ? {
                name: property.user.name,
                profileImage: property.user.profileImage,
                role: property.user.role,
              }
            : null,
          isFavorite: userId ? favoritePropertyIds.has(property.id) : false,
        };
      },
    );

    const totalPages = Math.ceil(result.total / limit);

    return {
      success: true,
      properties,
      total: result.total,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * Get count of properties matching filters (similar to searchEndUserProperties but only returns count)
   */
  async getEndUserPropertiesCount(
    query: EndUserPropertiesCountQueryDto,
  ): Promise<EndUserPropertiesCountResponseDto> {
    const cacheKey = `properties:count:${this.stableQueryHash(query as unknown as EndUserPropertiesSearchQueryDto)}`;
    return this.cache.getOrSet(cacheKey, 60_000, () => this.runEndUserPropertiesCount(query));
  }

  private async runEndUserPropertiesCount(
    query: EndUserPropertiesCountQueryDto,
  ): Promise<EndUserPropertiesCountResponseDto> {
    const {
      cityId,
      search,
      categoryIds,
      listingTypeIds,
      propertyTypeIds,
      bhkTypeIds,
      furnishingTypes,
      constructionStatuses,
      minPrice,
      maxPrice,
      latitude,
      longitude,
      radius,
      minSize,
      maxSize,
      amenityIds,
      postedBy,
    } = query;

    const result = await this.propertyRepository.findEndUserProperties({
      page: 1, // Use page 1 for count
      limit: 1, // Use minimal limit since we only need count
      sortBy: 'createdAt', // Default sort (not used in count, but required by repository)
      sortOrder: 'DESC', // Default order (not used in count, but required by repository)
      filters: {
        cityId,
        search,
        categoryIds,
        listingTypeIds,
        propertyTypeIds,
        bhkTypeIds,
        furnishingTypes,
        constructionStatuses,
        minPrice,
        maxPrice,
        latitude,
        longitude,
        radius,
        minSize,
        maxSize,
        amenityIds,
        postedBy,
      },
    });

    return {
      success: true,
      count: result.total,
    };
  }

  /**
   * Get top properties for end users
   * Returns top 5 properties filtered by city
   */
  async getTopProperties(
    query: EndUserTopPropertiesQueryDto,
  ): Promise<EndUserTopPropertiesResponseDto> {
    return this.cache.getOrSet(
      `properties:top:${query.cityId ?? 'all'}`,
      120_000,
      () => this.computeTopProperties(query),
    );
  }

  private async computeTopProperties(
    query: EndUserTopPropertiesQueryDto,
  ): Promise<EndUserTopPropertiesResponseDto> {
    const { cityId } = query;
    const limit = 5; // Top 5 properties as per requirement

    const result = await this.propertyRepository.findTopProperties({
      page: 1,
      limit,
      cityId,
      status: PropertyStatus.ACTIVE,
    });

    // Map properties to response DTO (reuse the same mapping logic as searchEndUserProperties)
    const properties: EndUserPropertyListItemDto[] = result.items.map(
      (property) => {
        // Filter to only approved media, then get primary image and all images
        const approvedPhotos = this.filterApprovedPhotos(property.photos);
        const approvedVideos = this.filterApprovedVideos(property.videos);
        let imageUrl: string | null = null;
        let images: EndUserPropertyImageDto[] | undefined = undefined;
        if (approvedPhotos.length > 0) {
          const coverImage = approvedPhotos.find((p) => p.isCoverImage);
          const firstPhoto = approvedPhotos[0];
          const selectedPhoto = coverImage || firstPhoto;
          imageUrl = selectedPhoto.fileKey ? this.s3Service.generateFileUrl(selectedPhoto.fileKey) : null;

          // Map all approved images
          images = approvedPhotos.map((photo) => ({
            fileKey: photo.fileKey,
            url: photo.fileKey ? this.s3Service.generateFileUrl(photo.fileKey) : null,
            view: photo.view,
            isCoverImage: photo.isCoverImage || false,
          }));
        }

        // Map all approved videos
        let videos: EndUserPropertyVideoDto[] | undefined = undefined;
        if (approvedVideos.length > 0) {
          videos = approvedVideos.map((video) => ({
            fileKey: video.fileKey,
            url: video.fileKey ? this.s3Service.generateFileUrl(video.fileKey) : null,
            format: video.format,
          }));
        }

        // Build address
        const addressParts: string[] = [];
        if (property.society?.name) {
          addressParts.push(property.society.name);
        }
        if (property.locality?.name) {
          addressParts.push(property.locality.name);
        }
        if (property.city?.name) {
          addressParts.push(property.city.name);
        }
        const address = addressParts.join(', ') || 'Address not available';

        // Build property name (use society name or property description)
        const propertyName =
          property.society?.name ||
          property.propertyDescription?.split('.')[0] ||
          'Property';

        // Build units array
        const units: EndUserPropertyUnitDto[] = [];
        if (property.bhkType?.name && property.builtUpAreaMetadata) {
          const superBuiltUpArea = property.builtUpAreaMetadata.superBuiltUpArea
            ? `${property.builtUpAreaMetadata.superBuiltUpArea} Sq. Ft.`
            : property.builtUpAreaMetadata.carpetArea
              ? `${property.builtUpAreaMetadata.carpetArea} Sq. Ft.`
              : 'Size not available';
          const price =
            property.price != null
              ? `₹ ${property.price.toLocaleString('en-IN')}`
              : property.monthlyRent != null
                ? `₹ ${property.monthlyRent.toLocaleString('en-IN')}/month`
                : 'Price On Request';

          units.push({
            unit: property.bhkType.name,
            size: `${superBuiltUpArea} (Saleable)`,
            price,
          });
        }

        return {
          id: property.id,
          propertyName,
          address,
          description: property.propertyDescription || undefined,
          imageUrl,
          images: images,
          videos: videos,
          isReraRegistered: false,
          constructionStatus: property.constructionStatus || null,
          categoryId: property.category?.id ?? null,
          category: property.category?.name || null,
          listingTypeId: property.listingType?.id ?? null,
          listingType: property.listingType?.name || null,
          propertyTypeId: property.propertyType?.id ?? null,
          propertyType: property.propertyType?.name || null,
          bhkTypeId: property.bhkType?.id ?? null,
          bhkType: property.bhkType?.name || null,
          price: property.price || null,
          monthlyRent: property.monthlyRent || null,
          cityId: property.city?.id ?? null,
          city: property.city?.name || null,
          society: property.society?.name || null,
          locality: property.locality?.name || null,
          units: units.length > 0 ? units : undefined,
        };
      },
    );

    return {
      success: true,
      properties,
      total: result.total,
    };
  }

  /**
   * Get featured properties for end users
   * Returns featured properties filtered by city
   */
  async getFeaturedProperties(
    query: EndUserFeaturedPropertiesQueryDto,
  ): Promise<EndUserFeaturedPropertiesResponseDto> {
    return this.cache.getOrSet(
      `properties:featured:${query.cityId ?? 'all'}`,
      120_000,
      () => this.computeFeaturedProperties(query),
    );
  }

  private async computeFeaturedProperties(
    query: EndUserFeaturedPropertiesQueryDto,
  ): Promise<EndUserFeaturedPropertiesResponseDto> {
    const { cityId } = query;
    const limit = 5; // Featured properties limit

    const result = await this.propertyRepository.findFeaturedProperties({
      page: 1,
      limit,
      cityId,
      status: PropertyStatus.ACTIVE,
    });

    const ratingsMap = await this.getRatingsMapForProperties(result.items.map((p) => p.id));

    // Map properties to response DTO (reuse the same mapping logic as top properties)
    const properties: EndUserPropertyListItemDto[] = result.items.map(
      (property) => {
        const rating = ratingsMap.get(property.id);
        // Filter to only approved media, then get primary image and all images
        const approvedPhotos = this.filterApprovedPhotos(property.photos);
        const approvedVideos = this.filterApprovedVideos(property.videos);
        let imageUrl: string | null = null;
        let images: EndUserPropertyImageDto[] | undefined = undefined;
        if (approvedPhotos.length > 0) {
          const coverImage = approvedPhotos.find((p) => p.isCoverImage);
          const firstPhoto = approvedPhotos[0];
          const selectedPhoto = coverImage || firstPhoto;
          imageUrl = selectedPhoto.fileKey ? this.s3Service.generateFileUrl(selectedPhoto.fileKey) : null;

          // Map all approved images
          images = approvedPhotos.map((photo) => ({
            fileKey: photo.fileKey,
            url: photo.fileKey ? this.s3Service.generateFileUrl(photo.fileKey) : null,
            view: photo.view,
            isCoverImage: photo.isCoverImage || false,
          }));
        }

        // Map all approved videos
        let videos: EndUserPropertyVideoDto[] | undefined = undefined;
        if (approvedVideos.length > 0) {
          videos = approvedVideos.map((video) => ({
            fileKey: video.fileKey,
            url: video.fileKey ? this.s3Service.generateFileUrl(video.fileKey) : null,
            format: video.format,
          }));
        }

        // Build address
        const addressParts: string[] = [];
        if (property.society?.name) {
          addressParts.push(property.society.name);
        }
        if (property.locality?.name) {
          addressParts.push(property.locality.name);
        }
        if (property.city?.name) {
          addressParts.push(property.city.name);
        }
        const address = addressParts.join(', ') || 'Address not available';

        // Build property name (use society name or property description)
        const propertyName =
          property.society?.name ||
          property.propertyDescription?.split('.')[0] ||
          'Property';

        // Build units array
        const units: EndUserPropertyUnitDto[] = [];
        if (property.bhkType?.name && property.builtUpAreaMetadata) {
          const superBuiltUpArea = property.builtUpAreaMetadata.superBuiltUpArea
            ? `${property.builtUpAreaMetadata.superBuiltUpArea} Sq. Ft.`
            : property.builtUpAreaMetadata.carpetArea
              ? `${property.builtUpAreaMetadata.carpetArea} Sq. Ft.`
              : 'Size not available';
          const price =
            property.price != null
              ? `₹ ${property.price.toLocaleString('en-IN')}`
              : property.monthlyRent != null
                ? `₹ ${property.monthlyRent.toLocaleString('en-IN')}/month`
                : 'Price On Request';

          units.push({
            unit: property.bhkType.name,
            size: `${superBuiltUpArea} (Saleable)`,
            price,
          });
        }

        return {
          id: property.id,
          propertyName,
          address,
          description: property.propertyDescription || undefined,
          imageUrl,
          images: images,
          videos: videos,
          isReraRegistered: false,
          constructionStatus: property.constructionStatus || null,
          categoryId: property.category?.id ?? null,
          category: property.category?.name || null,
          listingTypeId: property.listingType?.id ?? null,
          listingType: property.listingType?.name || null,
          propertyTypeId: property.propertyType?.id ?? null,
          propertyType: property.propertyType?.name || null,
          bhkTypeId: property.bhkType?.id ?? null,
          bhkType: property.bhkType?.name || null,
          price: property.price || null,
          monthlyRent: property.monthlyRent || null,
          cityId: property.city?.id ?? null,
          city: property.city?.name || null,
          society: property.society?.name || null,
          locality: property.locality?.name || null,
          units: units.length > 0 ? units : undefined,
          owner: property.user
            ? {
                name: property.user.name || null,
                profileImage: property.user.profileImage
                  ? this.s3Service.generateFileUrl(property.user.profileImage)
                  : null,
                role: property.user.role,
              }
            : undefined,
          averageRating: rating?.averageRating && rating.averageRating > 0 ? rating.averageRating : null,
          totalReviews: rating?.totalReviews ?? 0,
        } as EndUserPropertyListItemDto;
      },
    );

    return {
      success: true,
      properties,
      total: result.total,
    };
  }

  /**
   * Get similar properties based on city and optionally property type
   * Returns active properties in the same city
   */
  async getSimilarProperties(
    query: SimilarPropertiesQueryDto,
    userId?: string,
  ): Promise<SimilarPropertiesResponseDto> {
    const { cityId, propertyTypeId, limit = 10 } = query;

    // Build filters for property repository
    const filters: any = {
      cityId,
      propertyTypeIds: propertyTypeId ? [propertyTypeId] : undefined,
    };

    const result = await this.propertyRepository.findEndUserProperties({
      page: 1,
      limit,
      sortBy: 'createdAt',
      sortOrder: 'DESC',
      filters,
    });

    // Get favorite property IDs if user is logged in
    let favoritePropertyIds: Set<string> = new Set();
    if (userId) {
      const favoriteProperties = await this.favoritePropertyRepository.findByUserId(
        userId,
        1,
        10000,
      );
      favoritePropertyIds = new Set(
        favoriteProperties.items.map((fp) => fp.propertyId),
      );
    }

    // Get ratings for all properties
    const propertyIds = result.items.map((p) => p.id);
    const ratingsMap = new Map<string, { averageRating: number; totalReviews: number }>();

    for (const propertyId of propertyIds) {
      const stats = await this.propertyRatingReviewRepository.getRatingStatistics(
        propertyId,
      );
      ratingsMap.set(propertyId, {
        averageRating: stats.averageOverallRating,
        totalReviews: stats.totalReviews,
      });
    }

    // Map properties to response DTO
    const properties = result.items.map((property) => {
      // Filter to only approved media, then get primary image
      const approvedPhotos = this.filterApprovedPhotos(property.photos);
      let imageUrl: string | null = null;
      if (approvedPhotos.length > 0) {
        const coverImage = approvedPhotos.find((p) => p.isCoverImage);
        const firstPhoto = approvedPhotos[0];
        const selectedPhoto = coverImage || firstPhoto;
        imageUrl = selectedPhoto.fileKey ? this.s3Service.generateFileUrl(selectedPhoto.fileKey) : null;
      }

      // Build address
      const addressParts: string[] = [];
      if (property.houseNumber || property.flatNumber) {
        addressParts.push(property.houseNumber || property.flatNumber || '');
      }
      if (property.society?.name) {
        addressParts.push(property.society.name);
      }
      if (property.locality?.name) {
        addressParts.push(property.locality.name);
      }
      const address = addressParts.join(', ') || 'Address not available';

      // Build property title
      const titleParts: string[] = [];
      if (property.bhkType?.name) {
        titleParts.push(property.bhkType.name);
      }
      if (property.propertyType?.name) {
        titleParts.push(property.propertyType.name);
      }
      const title =
        titleParts.join(' ') ||
        property.society?.name ||
        property.propertyDescription?.split('.')[0] ||
        'Property';

      // Get area
      const areaFromMetadata = property.builtUpAreaMetadata?.superBuiltUpArea
        ? Number(property.builtUpAreaMetadata.superBuiltUpArea)
        : null;
      const area =
        property.builtUpArea ?? areaFromMetadata ?? property.carpetArea ?? null;
      const areaUnit =
        property.builtUpAreaUnit ??
        property.carpetAreaUnit ??
        (area != null ? 'Sq Ft' : null);

      // Get price and price type
      const price = property.price ?? property.monthlyRent ?? null;
      const priceType = property.price != null ? 'sale' : property.monthlyRent != null ? 'rent' : null;

      // Format listed on date
      const listedOn = property.createdAt.toISOString().split('T')[0];
      const listedOnFormatted = new Date(listedOn).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });

      // Get possession status
      let possessionStatus: string | null = null;
      if (property.possessionStatus === 'immediate') {
        possessionStatus = 'Ready to move';
      } else if (property.possessionStatus === 'future' && property.possessionDate) {
        const posDate = new Date(property.possessionDate);
        possessionStatus = `Available from ${posDate.toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })}`;
      }

      // Get ratings
      const ratings = ratingsMap.get(property.id) || {
        averageRating: null,
        totalReviews: 0,
      };

      // Get bathrooms from builtUpAreaMetadata
      const bathrooms = property.builtUpAreaMetadata?.noOfBathrooms || null;

      // Determine price type
      const finalPriceType: 'sale' | 'rent' | null = property.price != null ? 'sale' : property.monthlyRent != null ? 'rent' : null;

      return {
        id: property.id,
        title,
        address,
        imageUrl,
        propertyType: property.propertyType?.name || null,
        averageRating: (ratings.averageRating && ratings.averageRating > 0) ? ratings.averageRating : null,
        totalReviews: ratings.totalReviews,
        price,
        priceType: finalPriceType,
        listedOn: listedOnFormatted,
        possessionStatus,
        bedrooms: property.bhkType?.name
          ? parseInt(property.bhkType.name.match(/\d+/)?.[0] || '0') || null
          : null,
        bathrooms,
        area,
        areaUnit,
        owner: {
          id: property.user?.id || '',
          name: property.user?.name || null,
          profileImage: property.user?.profileImage || null,
          role: property.user?.role || 'OWNER',
        },
        isFavorite: userId ? favoritePropertyIds.has(property.id) : false,
      };
    });

    return {
      success: true,
      properties,
      total: result.total,
    };
  }

  /**
   * Get top cities by property count
   * Returns top 5 cities with maximum active properties
   */
  async getTopCities(): Promise<EndUserTopCitiesResponseDto> {
    const limit = 5; // Top 5 cities as per requirement
    const citiesWithCounts = await this.cityRepository.findTopCitiesByPropertyCount(limit);

    const cities: EndUserTopCityItemDto[] = citiesWithCounts.map((city) => ({
      id: city.id,
      name: city.name,
      code: city.code,
      state: city.state ?? null,
      latitude: city.latitude ? parseFloat(city.latitude.toString()) : null,
      longitude: city.longitude ? parseFloat(city.longitude.toString()) : null,
      icon: city.icon ?? null,
      imageUrl: city.imageUrl ?? null,
      propertyCount: city.propertyCount,
    }));

    return {
      success: true,
      cities,
    };
  }

  /**
   * Get Property Details for End User
   */
  async getEndUserPropertyDetails(
    propertyId: string,
  ): Promise<EndUserPropertyDetailsResponseDto> {
    const property = await this.propertyRepository.findByIdWithRelations(
      propertyId,
    );

    if (!property) {
      throw new BadRequestException('Property not found');
    }

    // Check if property is active and not deleted
    if (property.status !== PropertyStatus.ACTIVE || property.isDeleted) {
      throw new BadRequestException('Property is not available');
    }

    // Fetch the latest property verification request (ordered by createdAt DESC, so first is latest)
    const verificationRequests = await this.propertyVerificationRequestRepository.findByPropertyId(
      propertyId,
    );
    const latestVerificationRequest = verificationRequests[0] || null;

    // Check if property owner is a channel partner and fetch channel partner details
    const propertyOwner = property.user;
    let channelPartnerDetails: {
      id: string;
      name: string | null;
      firmName: string | null;
      profileImage: string | null;
      channelPartnerCode: string | null;
      phone: string;
      email: string | null;
      buyersServed: number;
      yearsOfExperience: number | null;
      propertyHoldings: number;
      areasOfOperation: number;
      propertyListings: { rent: number; sale: number };
    } | undefined = undefined;

    if (propertyOwner && propertyOwner.role === UserRole.CHANNEL_PARTNER) {
      // Calculate channel partner statistics
      const [
        totalLeads,
        propertyCount,
        categorizedProperties,
      ] = await Promise.all([
        this.leadRepository.countByUserId(propertyOwner.id),
        this.propertyRepository.countByUserId(propertyOwner.id),
        this.propertyRepository.findActivePropertiesByUserIdCategorized(
          propertyOwner.id,
        ),
      ]);

      // Calculate experience years
      let experienceYears: number | null = null;
      if (propertyOwner.businessSince) {
        const businessDate = new Date(propertyOwner.businessSince);
        const today = new Date();
        const years = Math.floor(
          (today.getTime() - businessDate.getTime()) /
            (1000 * 60 * 60 * 24 * 365.25),
        );
        experienceYears = Math.max(0, years);
      }

      // Parse areas of operation from cities field
      const areasOfOperationList = propertyOwner.cities
        ? propertyOwner.cities.split(',').map((city) => city.trim()).filter(Boolean)
        : [];
      const areasOfOperationCount = new Set(areasOfOperationList).size;

      // Count properties by listing type (rent/sale)
      const rentCount = categorizedProperties.rent.length;
      const saleCount = categorizedProperties.buy.length;

      channelPartnerDetails = {
        id: propertyOwner.id,
        name: propertyOwner.name,
        firmName: propertyOwner.firmName,
        profileImage: propertyOwner.profileImage,
        channelPartnerCode: propertyOwner.channelPartnerCode,
        phone: propertyOwner.phone,
        email: propertyOwner.email,
        buyersServed: totalLeads,
        yearsOfExperience: experienceYears,
        propertyHoldings: propertyCount,
        areasOfOperation: areasOfOperationCount,
        propertyListings: {
          rent: rentCount,
          sale: saleCount,
        },
      };
    }

    // For OWNER role, provide basic owner details
    let ownerDetails: {
      id: string;
      name: string | null;
      profileImage: string | null;
      phone: string;
      email: string | null;
    } | undefined = undefined;

    if (propertyOwner && propertyOwner.role === UserRole.OWNER && !channelPartnerDetails) {
      ownerDetails = {
        id: propertyOwner.id,
        name: propertyOwner.name,
        profileImage: propertyOwner.profileImage
          ? this.s3Service.generateFileUrl(propertyOwner.profileImage)
          : null,
        phone: propertyOwner.phone,
        email: propertyOwner.email,
      };
    }

    // Fetch ratings and reviews statistics
    const [ratingStats, likeDislikeTexts, sampleReviews] = await Promise.all([
      this.propertyRatingReviewRepository.getRatingStatistics(propertyId),
      this.propertyRatingReviewRepository.getLikeDislikeTexts(propertyId),
      this.propertyRatingReviewRepository.findAllByProperty(propertyId, 3), // Get first 3 reviews
    ]);

    // Format ratings and reviews data
    const ratingsAndReviews = ratingStats.totalReviews > 0 ? {
      totalReviews: ratingStats.totalReviews,
      averageOverallRating: ratingStats.averageOverallRating,
      starDistribution: ratingStats.starDistribution,
      featureRatings: {
        connectivity: ratingStats.averageConnectivityRating,
        neighbourhood: ratingStats.averageNeighbourhoodRating,
        safety: ratingStats.averageSafetyRating,
        livability: ratingStats.averageLivabilityRating,
      },
      likes: likeDislikeTexts.likes,
      dislikes: likeDislikeTexts.dislikes,
    } : undefined;

    // Format sample reviews
    const formattedSampleReviews = sampleReviews.map((review) => ({
      id: review.id,
      endUserId: review.endUserId,
      reviewerName: review.endUser?.name || null,
      role: review.role,
      overallRating: Number(review.overallRating),
      connectivityRating: review.connectivityRating,
      neighbourhoodRating: review.neighbourhoodRating,
      safetyRating: review.safetyRating,
      livabilityRating: review.livabilityRating,
      likeText: review.likeText,
      dislikeText: review.dislikeText,
      createdAt: review.createdAt,
    }));

    // Build location object with lat/lng (prefer society > city)
    const lat = property.society?.latitude
      ? parseFloat(property.society.latitude.toString())
      : property.city?.latitude
        ? parseFloat(property.city.latitude.toString())
        : null;
    const lng = property.society?.longitude
      ? parseFloat(property.society.longitude.toString())
      : property.city?.longitude
        ? parseFloat(property.city.longitude.toString())
        : null;

    const addrParts: string[] = [];
    if (property.society?.name) addrParts.push(property.society.name);
    if (property.locality?.name) addrParts.push(property.locality.name);
    if (property.city?.name) addrParts.push(property.city.name);

    const location = {
      latitude: lat,
      longitude: lng,
      state: property.city?.state || null,
      city: property.city?.name || null,
      society: property.society?.name || null,
      locality: property.locality?.name || null,
      address: addrParts.length > 0 ? addrParts.join(', ') : null,
    };

    // Build propertyName and cityName for the response
    const propertyName =
      property.society?.name ||
      property.propertyDescription?.split('.')[0] ||
      'Property';
    const cityName = property.city?.name || null;

    // Filter to only approved media and convert file keys to full S3 URLs
    if (property.photos && Array.isArray(property.photos)) {
      property.photos = this.filterApprovedPhotos(property.photos).map((photo: any) => ({
        ...photo,
        url: photo.fileKey ? this.s3Service.generateFileUrl(photo.fileKey) : null,
      }));
    }
    if (property.videos && Array.isArray(property.videos)) {
      property.videos = this.filterApprovedVideos(property.videos).map((video: any) => ({
        ...video,
        url: video.fileKey ? this.s3Service.generateFileUrl(video.fileKey) : null,
      }));
    }

    // Convert channel partner profile image to full URL
    if (channelPartnerDetails?.profileImage) {
      channelPartnerDetails.profileImage = this.s3Service.generateFileUrl(channelPartnerDetails.profileImage);
    }

    // Strip sensitive fields from user object before returning
    const safeUser = propertyOwner ? {
      id: propertyOwner.id,
      name: propertyOwner.name,
      phone: propertyOwner.phone,
      email: propertyOwner.email,
      role: propertyOwner.role,
      profileImage: propertyOwner.profileImage
        ? this.s3Service.generateFileUrl(propertyOwner.profileImage)
        : null,
    } : null;

    // Build flattened fields for frontend (relation objects → strings)
    const listingTypeName = (property.listingType as any)?.name || null;
    const categoryName = (property.category as any)?.name || null;
    const propertyTypeName = (property.propertyType as any)?.name || null;
    const localityName = property.locality?.name || null;
    const societyName = property.society?.name || null;
    const bhkTypeName = (property.bhkType as any)?.name || null;
    const totalFloorCount = property.totalFloors || null;
    const towerOrBlock = property.towerBlock || null;
    const buildUpAreaSqFt = property.builtUpArea || null;
    const buildUpAreaUnit = property.builtUpAreaUnit || 'sq ft';
    const projectName = property.society?.name || null;

    // Format age of property as readable string
    let age: string | null = null;
    if (property.ageOfProperty != null) {
      if (property.ageOfProperty === 0) age = 'Less than 1 year';
      else if (property.ageOfProperty === 1) age = '1 year';
      else age = `${property.ageOfProperty} years`;
    }

    // Join additional rooms array into comma-separated string
    const additionalRoomsText = property.additionalRooms?.length
      ? property.additionalRooms.join(', ')
      : null;

    // Resolve amenities codes to names (amenities field stores codes/names as simple-array)
    const amenitiesList = property.amenities?.length
      ? property.amenities.map((a) => a.trim()).filter(Boolean)
      : [];

    // Return the full property entity with all loaded relations (photos, videos, master data, owner, etc.)
    // Replace raw user object with safe version, add flattened fields
    const { user: _rawUser, ...propertyWithoutUser } = property as any;
    return {
      success: true,
      property: {
        ...propertyWithoutUser,
        user: safeUser,
        propertyName,
        cityName,
        // Flattened string fields for frontend property info grid
        listingTypeName,
        categoryName,
        propertyTypeName,
        localityName,
        societyName,
        projectName,
        bhkTypeName,
        totalFloorCount,
        towerOrBlock,
        buildUpAreaSqFt,
        buildUpAreaUnit,
        age,
        additionalRoomsText,
        amenitiesList,
      },
      location,
      verificationStatus: latestVerificationRequest?.status || null,
      comments: latestVerificationRequest?.rejectionReason || null,
      channelPartnerDetails,
      ownerDetails,
      ratingsAndReviews,
      sampleReviews: formattedSampleReviews.length > 0 ? formattedSampleReviews : undefined,
    };
  }

  /**
   * Get property media (photos and videos) for the Property Gallery screen.
   * Returns media grouped by category (Cover Image, Exterior, Bedroom, etc.) and includes verified live photos/videos.
   */
  async getPropertyMedia(propertyId: string): Promise<GetPropertyMediaResponseDto> {
    const property = await this.propertyRepository.findByIdWithRelations(propertyId);
    if (!property) {
      throw new BadRequestException('Property not found');
    }
    if (property.status !== PropertyStatus.ACTIVE || property.isDeleted) {
      throw new BadRequestException('Property is not available');
    }

    const verificationRequests =
      await this.propertyVerificationRequestRepository.findByPropertyId(propertyId);
    const approvedVerification = verificationRequests.find(
      (r) => r.status === PropertyVerificationStatus.APPROVED,
    );

    const listingPhotos = this.filterApprovedPhotos(property.photos);
    const listingVideos = this.filterApprovedVideos(property.videos);
    const livePhotos = approvedVerification?.livePhotos ?? [];
    const liveVideos = approvedVerification?.liveVideos ?? [];

    const allPhotos: Array<{ fileKey: string; url: string; view: string; isCoverImage: boolean; isVerified: boolean }> = [
      ...listingPhotos.map((p) => ({
        fileKey: p.fileKey,
        url: this.s3Service.generateFileUrl(p.fileKey),
        view: p.view ?? 'Other',
        isCoverImage: p.isCoverImage ?? false,
        isVerified: false,
      })),
      ...livePhotos.map((p) => ({
        fileKey: p.fileKey,
        url: this.s3Service.generateFileUrl(p.fileKey),
        view: p.view ?? 'Other',
        isCoverImage: false,
        isVerified: true,
      })),
    ];

    const allVideos = [
      ...listingVideos.map((v) => ({ fileKey: v.fileKey, url: this.s3Service.generateFileUrl(v.fileKey), format: v.format ?? 'mp4', isVerified: false })),
      ...liveVideos.map((v) => ({
        fileKey: v.fileKey,
        url: this.s3Service.generateFileUrl(v.fileKey),
        format: v.format ?? 'mp4',
        isVerified: true,
      })),
    ];

    const categories = this.groupPhotosByCategory(allPhotos);

    const propertyName =
      property.society?.name ||
      property.propertyDescription?.split('.')[0] ||
      'Property';
    const price =
      property.monthlyRent != null
        ? `₹${property.monthlyRent.toLocaleString('en-IN')}/month`
        : property.price != null
          ? `₹${property.price.toLocaleString('en-IN')}`
          : 'Price On Request';
    const addressParts: string[] = [];
    if (property.city?.state) addressParts.push(property.city.state);
    addressParts.push('India');
    if (property.society?.pincode) addressParts.push(property.society.pincode);
    const address = addressParts.join(', ') || 'Address not available';

    return {
      success: true,
      property: {
        id: property.id,
        name: propertyName,
        price,
        address,
      },
      photoCount: allPhotos.length,
      videoCount: allVideos.length,
      categories,
      videos: allVideos,
    };
  }

  private filterApprovedPhotos(photos: any[] | null | undefined): any[] {
    if (!photos || !Array.isArray(photos)) return [];
    return photos.filter((p) => p.approvalStatus === 'approved');
  }

  private filterApprovedVideos(videos: any[] | null | undefined): any[] {
    if (!videos || !Array.isArray(videos)) return [];
    return videos.filter((v) => v.approvalStatus === 'approved');
  }

  private groupPhotosByCategory(
    photos: Array<{ fileKey: string; view: string; isCoverImage: boolean; isVerified: boolean }>,
  ): Array<{ name: string; photos: typeof photos }> {
    const coverPhotos = photos.filter((p) => p.isCoverImage);
    const nonCoverPhotos = photos.filter((p) => !p.isCoverImage);
    const byView = new Map<string, typeof photos>();
    for (const p of nonCoverPhotos) {
      const view = p.view || 'Other';
      if (!byView.has(view)) byView.set(view, []);
      byView.get(view)!.push(p);
    }
    const categories: Array<{ name: string; photos: typeof photos }> = [];
    if (coverPhotos.length > 0) {
      categories.push({ name: 'Cover Image', photos: coverPhotos });
    }
    const viewOrder = ['Exterior', 'Living Room', 'Bedroom', 'Kitchen', 'Bathroom', 'Balcony', 'Parking', 'Amenities', 'Other'];
    for (const view of viewOrder) {
      const items = byView.get(view);
      if (items && items.length > 0) {
        categories.push({ name: view, photos: items });
      }
    }
    for (const [view, items] of byView) {
      if (!viewOrder.includes(view)) {
        categories.push({ name: view, photos: items });
      }
    }
    return categories;
  }

  /**
   * Auto-detect nearby cities using Google Places API based on latitude/longitude
   */
  async autoDetectCity(
    latitude: number,
    longitude: number,
  ): Promise<any[]> {
    // Search for nearby cities within 10-15 km
    const nearbyCities = await this.googlePlacesService.searchNearbyCities(
      latitude,
      longitude,
      15000, // 15km radius
    );

    // Map to response format
    return nearbyCities.map((city) => ({
      id: city.placeId || `google-${Math.random()}`,
      name: city.name,
      code: city.name.toLowerCase().replace(/\s+/g, '-'),
      state: city.state || undefined,
      latitude: city.latitude || undefined,
      longitude: city.longitude || undefined,
      source: 'google',
      country: city.country,
      placeId: city.placeId,
    }));
  }

  /**
   * Upload profile picture
   */
  async uploadProfilePic(
    userId: string,
    uploadProfilePicDto: UploadProfilePicDto,
  ): Promise<UploadProfilePicResponseDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    await this.userRepository.update(userId, {
      profileImage: uploadProfilePicDto.profile_pic_url,
    });

    return {
      success: true,
      message: 'Profile picture uploaded successfully',
      profile_pic_url: uploadProfilePicDto.profile_pic_url,
    };
  }

  /**
   * Get profile picture
   */
  async getProfilePic(
    userId: string,
  ): Promise<GetProfilePicResponseDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    return {
      success: true,
      profile_pic_url: user.profileImage ?? null,
    };
  }

  /**
   * Step 1: Upload live photo
   */
  async uploadLivePhoto(
    userId: string,
    uploadLivePhotoDto: UploadLivePhotoDto,
  ): Promise<UploadLivePhotoResponseDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Prepare update data
    const updateData: Partial<User> = {
      livePhotoUrl: uploadLivePhotoDto.live_photo_url,
      livePhotoApproved: false, // Reset approval status when new photo is uploaded
    };

    // If KYC was previously rejected, move status back to IN_REVIEW or PENDING
    if (user.kycStatus === KycStatus.REJECTED) {
      // Clear rejection reason
      updateData.kycRejectionReason = null;
      
      // Check if all user steps are completed to determine new status
      const agreementStatus = await this.getDocuSignAgreementStatus(userId);
      const step1Completed = !!(uploadLivePhotoDto.live_photo_url && uploadLivePhotoDto.live_photo_url.trim().length > 0);
      const allUserStepsCompleted =
        step1Completed && // Step 1: Live photo uploaded (user action)
        user.aadhaarVerified && // Step 2: Aadhaar verified (user action)
        user.bankDetailsFilled && // Step 3: Bank details filled (user action)
        agreementStatus.docusign_agreement_signed; // Step 4: DocuSign signed (user action)

      // Set status to IN_REVIEW if all steps completed, otherwise PENDING
      updateData.kycStatus = allUserStepsCompleted
        ? KycStatus.IN_REVIEW
        : KycStatus.PENDING;
    }

    await this.userRepository.update(userId, updateData);

    // Check and update KYC status (this will maintain the status if it's not REJECTED anymore)
    await this.checkAndUpdateKycStatus(userId);

    const updatedUser = await this.userRepository.findById(userId);
    return {
      success: true,
      message: 'Live photo uploaded successfully. Waiting for admin approval.',
      live_photo_url: uploadLivePhotoDto.live_photo_url,
      live_photo_approved: updatedUser?.livePhotoApproved ?? false,
    };
  }

  /**
   * Step 2: Verify Aadhaar
   * Accepts aadhaar_number, digilocker_clientid (optional), and isVerified
   */
  async verifyAadhaar(
    userId: string,
    verifyAadhaarDto: VerifyAadhaarDto,
  ): Promise<VerifyAadhaarResponseDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Store Aadhaar number (if provided), DigiLocker client ID (if provided), metadata, and verification status
    await this.userRepository.update(userId, {
      ...(verifyAadhaarDto.aadhaar_number != null &&
        verifyAadhaarDto.aadhaar_number !== '' && {
          aadhaarNumber: verifyAadhaarDto.aadhaar_number,
        }),
      aadhaarVerified: verifyAadhaarDto.isVerified,
      ...(verifyAadhaarDto.digilocker_clientid != null && {
        digilockerClientid: verifyAadhaarDto.digilocker_clientid,
      }),
      ...(verifyAadhaarDto.digilocker_metadata != null && {
        digilockerMetadata: verifyAadhaarDto.digilocker_metadata,
      }),
    });

    // Check and update KYC status
    await this.checkAndUpdateKycStatus(userId);

    return {
      success: true,
      message: 'Aadhaar details saved successfully',
      aadhaar_verified: verifyAadhaarDto.isVerified,
      digilocker_clientid: verifyAadhaarDto.digilocker_clientid ?? null,
      digilocker_metadata: verifyAadhaarDto.digilocker_metadata ?? null,
    };
  }

  /**
   * Step 3: Save bank details (encrypted)
   */
  async saveBankDetails(
    userId: string,
    bankDetailsDto: BankDetailsDto,
  ): Promise<BankDetailsResponseDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Encrypt sensitive fields
    const encryptedAccountNumber = this.encryptionService.encrypt(
      bankDetailsDto.account_number,
    );
    const encryptedIfscCode = this.encryptionService.encrypt(
      bankDetailsDto.ifsc_code,
    );

    // Save encrypted bank details
    await this.bankDetailsRepository.upsertBankDetails(userId, {
      accountNumber: encryptedAccountNumber,
      ifscCode: encryptedIfscCode,
      bankName: bankDetailsDto.bank_name,
      accountHolderName: bankDetailsDto.account_holder_name,
      branchName: bankDetailsDto.branch_name || null,
    });

    // Mark bank details as filled
    await this.userRepository.update(userId, {
      bankDetailsFilled: true,
    });

    // Check and update KYC status
    await this.checkAndUpdateKycStatus(userId);

    return {
      success: true,
      message: 'Bank details saved successfully',
      bank_details_filled: true,
    };
  }

  /**
   * Get bank details (decrypted) - for admin or user viewing their own details
   */
  async getBankDetails(userId: string): Promise<BankDetailsDto | null> {
    const bankDetails = await this.bankDetailsRepository.findByUserId(userId);
    if (!bankDetails) {
      return null;
    }

    // Decrypt sensitive fields
    try {
      const decryptedAccountNumber = this.encryptionService.decrypt(
        bankDetails.accountNumber,
      );
      const decryptedIfscCode = this.encryptionService.decrypt(
        bankDetails.ifscCode,
      );

      return {
        account_number: decryptedAccountNumber,
        ifsc_code: decryptedIfscCode,
        bank_name: bankDetails.bankName,
        account_holder_name: bankDetails.accountHolderName,
        branch_name: bankDetails.branchName || undefined,
      };
    } catch (error) {
      this.logger.error('Failed to decrypt bank details', error);
      throw new BadRequestException('Failed to retrieve bank details');
    }
  }

  /**
   * Get live photo with status
   */
  async getLivePhoto(userId: string): Promise<GetLivePhotoResponseDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    return {
      success: true,
      live_photo_url: user.livePhotoUrl ?? null,
      live_photo_approved: user.livePhotoApproved,
    };
  }

  /**
   * Get Aadhaar details with status
   */
  async getAadhaarDetails(
    userId: string,
  ): Promise<GetAadhaarDetailsResponseDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    return {
      success: true,
      aadhaar_number: user.aadhaarNumber ?? null,
      aadhaar_verified: user.aadhaarVerified,
      digilocker_clientid: user.digilockerClientid ?? null,
      digilocker_metadata: user.digilockerMetadata ?? null,
    };
  }

  /**
   * Get bank details (for user endpoint)
   */
  async getUserBankDetails(
    userId: string,
  ): Promise<GetBankDetailsResponseDto> {
    const bankDetails = await this.getBankDetails(userId);

    return {
      success: true,
      bank_details: bankDetails,
    };
  }

  /**
   * Step 4: Get DocuSign agreement status
   */
  async getDocuSignAgreementStatus(
    userId: string,
  ): Promise<DocuSignAgreementStatusResponseDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Check if there's a completed agreement
    const agreements = await this.agreementRepository.findByUserId(userId);
    const completedAgreement = agreements.find(
      (agreement) => agreement.status === AgreementStatus.COMPLETED,
    );

    const isSigned = !!completedAgreement || user.docusignAgreementSigned;

    if (completedAgreement && !user.docusignAgreementSigned) {
      // Update the flag if agreement is completed but flag is not set
      await this.userRepository.update(userId, {
        docusignAgreementSigned: true,
      });
    }

    return {
      success: true,
      docusign_agreement_signed: isSigned,
      envelope_id: completedAgreement?.envelopeId ?? null,
    };
  }

  /**
   * Check and update KYC completion status
   * KYC is completed when all 4 steps are done:
   * 1. Live photo uploaded and approved by admin
   * 2. Aadhaar verified
   * 3. Bank details filled
   * 4. DocuSign agreement signed
   */
  async checkAndUpdateKycStatus(userId: string): Promise<boolean> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      return false;
    }

    // Check DocuSign agreement status (might be updated in agreement table)
    const agreementStatus = await this.getDocuSignAgreementStatus(userId);

    // OWNER only needs DocuSign agreement; CP needs all 4 steps
    const isOwner = user.role === UserRole.OWNER;
    const step1Completed = !!(user.livePhotoUrl && user.livePhotoUrl.trim().length > 0);
    const allUserStepsCompleted = isOwner
      ? agreementStatus.docusign_agreement_signed
      : step1Completed && // Step 1: Live photo uploaded (user action)
        user.aadhaarVerified && // Step 2: Aadhaar verified (user action)
        user.bankDetailsFilled && // Step 3: Bank details filled (user action)
        agreementStatus.docusign_agreement_signed; // Step 4: DocuSign signed (user action)

    // Check if all admin approvals are done
    const allAdminApproved = isOwner
      ? agreementStatus.docusign_agreement_signed
      : user.livePhotoApproved &&
        user.aadhaarAdminApproved &&
        user.bankDetailsApproved &&
        agreementStatus.docusign_agreement_signed;

    // Determine KYC status based on current state
    let newKycStatus: KycStatus | null = null;

    if (user.kycStatus === KycStatus.REJECTED) {
      // Don't override admin rejection
      newKycStatus = user.kycStatus;
    } else if (allUserStepsCompleted && allAdminApproved) {
      // All user steps done + all admin approvals done → APPROVED
      newKycStatus = KycStatus.APPROVED;
    } else if (allUserStepsCompleted) {
      // All user steps done but admin hasn't approved all → IN_REVIEW
      newKycStatus = KycStatus.IN_REVIEW;
    } else {
      // Some or no steps completed → PENDING
      newKycStatus = KycStatus.PENDING;
    }

    // KYC is completed only if status is APPROVED
    const isKycCompleted = newKycStatus === KycStatus.APPROVED;

    // Update KYC status and completion flag if changed
    const updateData: Partial<User> = {};
    if (user.kycCompleted !== isKycCompleted) {
      updateData.kycCompleted = isKycCompleted;
    }
    // Only update status if it's different and we're not preserving an admin decision
    if (user.kycStatus !== newKycStatus && newKycStatus !== null) {
      updateData.kycStatus = newKycStatus;
    }

    if (Object.keys(updateData).length > 0) {
      await this.userRepository.update(userId, updateData);
    }

    return isKycCompleted;
  }

  /**
   * Get all verification steps status
   */
  async getVerificationStepsStatus(
    userId: string,
  ): Promise<VerificationStepsStatusResponseDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Check and update KYC status
    const kycCompleted = await this.checkAndUpdateKycStatus(userId);

    // Check DocuSign agreement status
    const agreementStatus = await this.getDocuSignAgreementStatus(userId);

    // Calculate progress
    // OWNER only has DocuSign step; CP has all 4 steps
    const isOwner = user.role === UserRole.OWNER;
    const step1Completed = !!(user.livePhotoUrl && user.livePhotoUrl.trim().length > 0);
    const steps = isOwner
      ? [agreementStatus.docusign_agreement_signed]
      : [
          step1Completed, // Step 1: Live photo uploaded (filled)
          user.aadhaarVerified, // Step 2
          user.bankDetailsFilled, // Step 3
          agreementStatus.docusign_agreement_signed, // Step 4
        ];
    const stepsCompleted = steps.filter(Boolean).length;
    const totalSteps = steps.length;
    const progress = Math.round((stepsCompleted / totalSteps) * 100);

    // Use the stored kycStatus from database, or determine it if not set
    const kycStatusValue = user.kycStatus || KycStatus.PENDING;
    const kycStatusString = kycStatusValue;

    return {
      success: true,
      role: user.role,
      step1_live_photo: {
        live_photo_url: user.livePhotoUrl ?? null,
        live_photo_approved: user.livePhotoApproved,
      },
      step2_aadhaar: {
        aadhaar_number: user.aadhaarNumber ?? null,
        aadhaar_verified: user.aadhaarVerified,
        digilocker_clientid: user.digilockerClientid ?? null,
        digilocker_metadata: user.digilockerMetadata ?? null,
      },
      step3_bank_details: {
        bank_details_filled: user.bankDetailsFilled,
      },
      step4_docusign_agreement: {
        docusign_agreement_signed: agreementStatus.docusign_agreement_signed,
      },
      kyc_completed: kycCompleted,
      kyc_progress: progress,
      kyc_steps_completed: stepsCompleted,
      kyc_total_steps: totalSteps,
      kyc_status: kycStatusString,
      kyc_rejection_reason: user.kycRejectionReason ?? null,
    };
  }

  /**
   * Check if email already exists in the system
   * Throws BadRequestException if email exists
   */
  async checkDuplicateEmail(email: string): Promise<{ message: string }> {
    const user = await this.userRepository.findByEmail(email);
    
    if (user) {
      throw new BadRequestException('Email already exists');
    }
    
    return {
      message: 'Email is available',
    };
  }

  /**
   * List channel partners with search and filters for end users
   */
  async listChannelPartners(
    query: EndUserChannelPartnerListQueryDto,
  ): Promise<EndUserChannelPartnerListResponseDto> {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 10));

    // Parse property range if provided
    let propertyCountMin: number | undefined;
    let propertyCountMax: number | null | undefined;
    if (query.properties) {
      [propertyCountMin, propertyCountMax] = this.parsePropertyRange(query.properties);
    }

    // Get channel partners with all filters applied in SQL
    const { items: users, total } = await this.userRepository.findChannelPartners({
      page,
      limit,
      search: query.search,
      city: query.city,
      experience: query.experience,
      propertyCountMin,
      propertyCountMax,
    });

    // Calculate property counts, experience, and ratings for each user (for response)
    const channelPartnersWithDetails = await Promise.all(
      users.map(async (user) => {
        const [propertyCount, ratingStats] = await Promise.all([
          this.propertyRepository.countByUserId(user.id),
          this.channelPartnerReviewRepository.getAverageRating(user.id),
        ]);

        // Calculate experience years from businessSince
        let experienceYears: number | null = null;
        if (user.businessSince) {
          const businessDate = new Date(user.businessSince);
          const today = new Date();
          const years = Math.floor(
            (today.getTime() - businessDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25)
          );
          experienceYears = Math.max(0, years);
        }

        return {
          user,
          propertyCount,
          experienceYears,
          ratingStats,
        };
      })
    );

    // Map to response DTO
    const data: ChannelPartnerListItemDto[] = channelPartnersWithDetails.map((item) => ({
      id: item.user.id,
      name: item.user.name,
      firm_name: item.user.firmName,
      profile_image: item.user.profileImage
        ? this.s3Service.generateFileUrl(item.user.profileImage)
        : null,
      cities: item.user.cities,
      experience_years: item.experienceYears,
      property_count: item.propertyCount,
      average_rating: item.ratingStats.averageRating > 0 ? item.ratingStats.averageRating : null,
      total_reviews: item.ratingStats.totalReviews,
    } as ChannelPartnerListItemDto));

    const totalPages = Math.max(1, Math.ceil(total / limit));

    return {
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  /**
   * Parse property range string to min and max values
   */
  private parsePropertyRange(range: string): [number, number | null] {
    if (range === '50+') {
      return [50, null];
    }
    const [min, max] = range.split('-').map(Number);
    return [min, max];
  }

  /**
   * Get channel partner details for end users
   */
  async getChannelPartnerDetails(
    channelPartnerId: string,
  ): Promise<EndUserChannelPartnerDetailsResponseDto> {
    const user = await this.userRepository.findById(channelPartnerId);
    if (!user) {
      throw new BadRequestException('Channel partner not found');
    }

    // Verify it's a channel partner
    if (user.role !== UserRole.CHANNEL_PARTNER) {
      throw new BadRequestException('User is not a channel partner');
    }

    // Verify channel partner is active and KYC completed
    if (!user.isActive || user.isBlocked || !user.kycCompleted) {
      throw new BadRequestException('Channel partner profile is not available');
    }

    // Calculate statistics
    const propertyCount = await this.propertyRepository.countByUserId(user.id);
    const activePropertyCount = await this.propertyRepository.countActivePropertiesByUserId(user.id);
    
    // Count total leads (buyers served)
    const totalLeads = await this.leadRepository.countByUserId(user.id);

    // Calculate experience years
    let experienceYears: number | null = null;
    if (user.businessSince) {
      const businessDate = new Date(user.businessSince);
      const today = new Date();
      const years = Math.floor(
        (today.getTime() - businessDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25)
      );
      experienceYears = Math.max(0, years);
    }

    // Parse areas of operation from cities field
    const areasOfOperationList = user.cities
      ? user.cities.split(',').map((city) => city.trim()).filter(Boolean)
      : [];
    const areasOfOperationCount = new Set(areasOfOperationList).size;

    // Fetch active properties categorized
    const categorizedProperties = await this.propertyRepository.findActivePropertiesByUserIdCategorized(
      user.id,
    );

    // Helper function to map property to EndUserPropertyListItemDto
    const mapProperty = (property: any): EndUserPropertyListItemDto => {
        // Filter to only approved media, then get primary image
        const approvedPhotos = this.filterApprovedPhotos(property.photos);
        let imageUrl: string | null = null;
        if (approvedPhotos.length > 0) {
          const coverImage = approvedPhotos.find((p) => p.isCoverImage);
          const firstPhoto = approvedPhotos[0];
          const selectedPhoto = coverImage || firstPhoto;
          imageUrl = selectedPhoto.fileKey ? this.s3Service.generateFileUrl(selectedPhoto.fileKey) : null;
        }

        // Build address
        const addressParts: string[] = [];
        if (property.society?.name) {
          addressParts.push(property.society.name);
        }
        if (property.locality?.name) {
          addressParts.push(property.locality.name);
        }
        if (property.city?.name) {
          addressParts.push(property.city.name);
        }
        const address = addressParts.join(', ') || 'Address not available';

        // Build property name (use society name or property description)
        const propertyName =
          property.society?.name ||
          property.propertyDescription?.split('.')[0] ||
          'Property';

        // Build units array (simplified - you may want to enhance this)
        const units: EndUserPropertyUnitDto[] = [];
        if (property.bhkType?.name && property.builtUpAreaMetadata) {
          const superBuiltUpArea = property.builtUpAreaMetadata.superBuiltUpArea
            ? `${property.builtUpAreaMetadata.superBuiltUpArea} Sq. Ft.`
            : property.builtUpAreaMetadata.carpetArea
              ? `${property.builtUpAreaMetadata.carpetArea} Sq. Ft.`
              : 'Size not available';
          const price =
            property.price != null
              ? `₹ ${property.price.toLocaleString('en-IN')}`
              : property.monthlyRent != null
                ? `₹ ${property.monthlyRent.toLocaleString('en-IN')}/month`
                : 'Price On Request';

          units.push({
            unit: property.bhkType.name,
            size: `${superBuiltUpArea} (Saleable)`,
            price,
          });
        }

      return {
        id: property.id,
        propertyName,
        address,
        description: property.propertyDescription || undefined,
        imageUrl,
        isReraRegistered: false, // Add RERA field to Property entity if needed
        constructionStatus: property.constructionStatus || null,
        categoryId: property.category?.id ?? null,
        category: property.category?.name || null,
        listingTypeId: property.listingType?.id ?? null,
        listingType: property.listingType?.name || null,
        propertyTypeId: property.propertyType?.id ?? null,
        propertyType: property.propertyType?.name || null,
        bhkTypeId: property.bhkType?.id ?? null,
        bhkType: property.bhkType?.name || null,
        price: property.price || null,
        monthlyRent: property.monthlyRent || null,
        city: property.city?.name || null,
        society: property.society?.name || null,
        locality: property.locality?.name || null,
        units: units.length > 0 ? units : undefined,
      };
    };

    // Map categorized properties
    const mappedActiveProperties = {
      buy: categorizedProperties.buy.map(mapProperty),
      rent: categorizedProperties.rent.map(mapProperty),
      commercial: categorizedProperties.commercial.map(mapProperty),
    };

    const statistics: ChannelPartnerStatisticsDto = {
      buyers_served: totalLeads,
      years_of_experience: experienceYears,
      property_holdings: propertyCount,
      active_properties: activePropertyCount,
      team_size: null, // Not available in database
      areas_of_operation: areasOfOperationCount,
    };

    // Fetch channel partner rating
    const ratingStats = await this.channelPartnerReviewRepository.getAverageRating(user.id);

    return {
      success: true,
      id: user.id,
      name: user.name,
      firm_name: user.firmName,
      channel_partner_code: user.channelPartnerCode,
      profile_image: user.profileImage
        ? this.s3Service.generateFileUrl(user.profileImage)
        : null,
      created_at: user.createdAt,
      phone: user.phone,
      email: user.email,
      about: user.aboutYourSelf,
      cities: user.cities,
      trusted_since: user.businessSince,
      statistics,
      areas_of_operation_list: areasOfOperationList,
      active_properties: mappedActiveProperties,
      average_rating: ratingStats.averageRating > 0 ? ratingStats.averageRating : null,
      total_reviews: ratingStats.totalReviews,
    } as EndUserChannelPartnerDetailsResponseDto;
  }

  /**
   * Send OTP for contact us (for non-logged in users)
   */
  async sendOtpForContactUs(
    sendOtpDto: SendOtpForContactUsDto,
  ): Promise<SendOtpForContactUsResponseDto> {
    const { phone } = sendOtpDto;
    return await this.sendOtp({ phone });
  }

  /**
   * Submit contact us query (for both logged in and non-logged in users)
   * If logged in: endUserId is provided, no OTP needed
   * If not logged in: endUserId is null, OTP is required
   */
  async submitContactUs(
    submitDto: SubmitContactUsDto,
    endUserId: string | null = null,
  ): Promise<ContactUsResponseDto> {
    const { name, phone, email, otp } = submitDto;

    // If user is logged in, verify the user exists
    if (endUserId) {
      const user = await this.userRepository.findById(endUserId);
      if (!user) {
        throw new BadRequestException('User not found');
      }

      // Create contact us query for logged in user
      const contactUsQuery = await this.contactUsKmaQueryRepository.create({
        name,
        phoneNumber: phone,
        email: email || null,
        endUserId, // Map to logged in end user
      });

      return {
        success: true,
        message: 'Contact us query submitted successfully',
        contactUsQueryId: contactUsQuery.id,
      };
    }

    // If not logged in, OTP is required
    if (!otp) {
      throw new BadRequestException(
        'OTP is required for non-logged in users. Please provide OTP or use /end-user/contact-us/send-otp to get one.',
      );
    }

    // Find the OTP record for this phone
    const otpRecord = await this.otpRepository.findActiveByPhone(phone);

    if (!otpRecord) {
      throw new BadRequestException(USER_MESSAGES.OTP.NO_VALID_OTP);
    }

    // Check if OTP has expired
    if (new Date() > otpRecord.expiresAt) {
      throw new BadRequestException(USER_MESSAGES.OTP.EXPIRED);
    }

    // Check if OTP is already used
    if (otpRecord.isUsed) {
      throw new BadRequestException(USER_MESSAGES.OTP.ALREADY_USED);
    }

    // Check if too many attempts
    if (otpRecord.attempts >= 3) {
      throw new BadRequestException(USER_MESSAGES.OTP.TOO_MANY_ATTEMPTS);
    }

    // Validate OTP code
    if (otpRecord.otpCode !== otp) {
      await this.otpRepository.incrementAttempts(otpRecord.id);
      throw new BadRequestException(USER_MESSAGES.OTP.INVALID);
    }

    // Use transaction to ensure atomicity
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Mark OTP as used
      await queryRunner.manager.update(
        'otps',
        { id: otpRecord.id },
        { isUsed: true },
      );

      // Create contact us query for non-logged in user
      const contactUsQuery = await this.contactUsKmaQueryRepository.create({
        name,
        phoneNumber: phone,
        email: email || null,
        endUserId: null, // Not logged in
      });

      // Commit transaction
      await queryRunner.commitTransaction();

      return {
        success: true,
        message: 'Contact us query submitted successfully',
        contactUsQueryId: contactUsQuery.id,
      };
    } catch (error) {
      // Rollback transaction on error
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // Release query runner
      await queryRunner.release();
    }
  }

  /**
   * Send OTP for contact property (for non-logged-in users)
   */
  async sendOtpForContactProperty(
    sendOtpDto: SendOtpContactPropertyDto,
  ): Promise<SendOtpContactPropertyResponseDto> {
    const { phone } = sendOtpDto;
    const result = await this.sendOtp({ phone });
    return {
      success: result.success,
      message: result.message,
    };
  }

  /**
   * Submit contact property form.
   * Logged-in: provide Authorization; no OTP, create with userId.
   * Non-logged-in: provide X-Session-Id header and otp; create with sessionId after OTP verification.
   */
  async submitContactProperty(
    propertyId: string,
    submitDto: SubmitContactPropertyDto,
    userId: string | null,
    sessionId: string | null,
  ): Promise<SubmitContactPropertyResponseDto> {
    const property = await this.propertyRepository.findById(propertyId);
    if (!property) {
      throw new BadRequestException('Property not found');
    }
    if (property.isDeleted) {
      throw new BadRequestException('Property not available');
    }

    const { name, email, phone, countryCode } = submitDto;

    if (userId) {
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new BadRequestException('User not found');
      }
      const contacted = await this.contactedPropertyRepository.create({
        userId,
        sessionId: null,
        propertyId,
        name: name || user.name || '',
        email: email || user.email || '',
        phone: phone || user.phone,
        countryCode: countryCode ?? null,
      });

      // Auto-create lead for the property owner/channel partner
      try {
        const leadPhone = `${countryCode || '+91'}${phone || user.phone}`;
        await this.leadService.createLeadFromPropertyContact({
          propertyId,
          name: name || user.name || '',
          phone: leadPhone,
          email: email || user.email || undefined,
        });
      } catch (err) {
        // Don't fail the contact request if lead creation fails
        this.logger.warn(`Failed to create lead for property ${propertyId}: ${err.message}`);
      }

      return {
        success: true,
        message: 'Contact request submitted successfully',
        contactedPropertyId: contacted.id,
      };
    }

    if (!submitDto.otp) {
      throw new BadRequestException(
        'OTP is required for non-logged-in users. Please provide OTP or use POST /end-user/properties/:propertyId/contact/send-otp to get one.',
      );
    }
    if (!sessionId) {
      throw new BadRequestException(
        'Session ID is required for non-logged-in users. Send X-Session-Id header.',
      );
    }

    const otpRecord = await this.otpRepository.findActiveByPhone(phone);
    if (!otpRecord) {
      throw new BadRequestException(USER_MESSAGES.OTP.NO_VALID_OTP);
    }
    if (new Date() > otpRecord.expiresAt) {
      throw new BadRequestException(USER_MESSAGES.OTP.EXPIRED);
    }
    if (otpRecord.isUsed) {
      throw new BadRequestException(USER_MESSAGES.OTP.ALREADY_USED);
    }
    if (otpRecord.attempts >= 3) {
      throw new BadRequestException(USER_MESSAGES.OTP.TOO_MANY_ATTEMPTS);
    }
    if (otpRecord.otpCode !== submitDto.otp) {
      await this.otpRepository.incrementAttempts(otpRecord.id);
      throw new BadRequestException(USER_MESSAGES.OTP.INVALID);
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    let issuedTokens: { accessToken: string; refreshToken: string } | null = null;
    let issuedUser: User | null = null;
    try {
      await queryRunner.manager.update(
        'otps',
        { id: otpRecord.id },
        { isUsed: true },
      );
      const contacted = await this.contactedPropertyRepository.create({
        sessionId,
        userId: null,
        propertyId,
        name,
        email,
        phone,
        countryCode: countryCode ?? null,
      });

      // OTP is verified — treat the caller as authenticated going forward.
      // Find or create an END_USER for this phone, then issue JWT tokens so
      // the frontend can drop the caller into a logged-in session.
      let endUser = await queryRunner.manager.findOne(User, {
        where: { phone, role: UserRole.END_USER },
      });

      if (!endUser) {
        const created = queryRunner.manager.create(User, {
          phone,
          role: UserRole.END_USER,
          name: name || 'User',
          email: email || null,
          isActive: true,
          phoneVerified: true,
          isBlocked: false,
          intent: null,
        });
        endUser = await queryRunner.manager.save(created);
      } else if (!endUser.phoneVerified) {
        await queryRunner.manager.update(
          User,
          { id: endUser.id },
          { phoneVerified: true },
        );
        endUser.phoneVerified = true;
      }

      if (endUser.isBlocked || !endUser.isActive) {
        // Account exists but cannot log in — skip token issue but keep the
        // contact record so the lead still reaches the agent.
        endUser = null;
      } else {
        const { accessToken, refreshToken } = this.generateTokens(endUser);
        await queryRunner.manager.update(
          User,
          { id: endUser.id },
          { token: accessToken, refreshToken },
        );
        issuedTokens = { accessToken, refreshToken };
        issuedUser = endUser;
      }

      await queryRunner.commitTransaction();

      // Auto-create lead for the property owner/channel partner
      try {
        const leadPhone = `${countryCode || '+91'}${phone}`;
        await this.leadService.createLeadFromPropertyContact({
          propertyId,
          name,
          phone: leadPhone,
          email: email || undefined,
        });
      } catch (err) {
        this.logger.warn(`Failed to create lead for property ${propertyId}: ${err.message}`);
      }

      if (sessionId && issuedUser) {
        try {
          await this.propertyViewTracker.mergeSessionWithUser(
            sessionId,
            issuedUser.id,
          );
        } catch (err) {
          this.logger.warn(
            `Failed to merge session ${sessionId} with user ${issuedUser.id}: ${err.message}`,
          );
        }
      }

      return {
        success: true,
        message: 'Contact request submitted successfully',
        contactedPropertyId: contacted.id,
        ...(issuedTokens && issuedUser
          ? {
              accessToken: issuedTokens.accessToken,
              refreshToken: issuedTokens.refreshToken,
              user: {
                id: issuedUser.id,
                name: issuedUser.name,
                email: issuedUser.email,
                phone: issuedUser.phone,
                role: issuedUser.role,
              },
            }
          : {}),
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Submit (or update) the KMA rating and review for a logged-in end user.
   * One review per end user — re-submitting overwrites the previous entry.
   */
  async submitRatingReview(
    submitDto: SubmitRatingReviewDto,
    endUserId: string,
  ): Promise<SubmitRatingReviewResponseDto> {
    const { rating, review } = submitDto;

    const user = await this.userRepository.findById(endUserId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Pull every row tied to this end user — there can be more than one if a
    // pre-upsert release allowed duplicates or if two concurrent submits
    // raced past the existing-row check before either committed.
    const allExisting =
      await this.kmaRatingReviewRepository.findAllByEndUserId(endUserId);
    if (allExisting.length > 0) {
      const [winner, ...losers] = allExisting; // findAll is ordered createdAt DESC
      if (losers.length > 0) {
        await this.kmaRatingReviewRepository.deleteByIds(
          losers.map((row) => row.id),
        );
      }
      await this.kmaRatingReviewRepository.update(winner.id, {
        rating,
        review: review || null,
        name: user.name || winner.name || 'User',
        phoneNumber: user.phone || winner.phoneNumber,
        email: user.email ?? winner.email,
      });
      return {
        success: true,
        message:
          losers.length > 0
            ? 'Rating and review updated (duplicates cleaned up)'
            : 'Rating and review updated successfully',
        ratingReviewId: winner.id,
      };
    }

    const ratingReview = await this.kmaRatingReviewRepository.create({
      rating,
      review: review || null,
      name: user.name || 'User',
      phoneNumber: user.phone,
      email: user.email || null,
      endUserId,
      isApproved: true,
      approvedAt: new Date(),
    });

    return {
      success: true,
      message: 'Rating and review submitted successfully',
      ratingReviewId: ratingReview.id,
    };
  }

  /**
   * Fetch the logged-in end-user's existing KMA review for prefill on the
   * Write Review dialog. Returns null if the user hasn't reviewed yet.
   */
  async getMyKmaRatingReview(endUserId: string) {
    const user = await this.userRepository.findById(endUserId);
    if (!user) {
      throw new BadRequestException('User not found');
    }
    const review =
      await this.kmaRatingReviewRepository.findOneByEndUserId(endUserId);
    return {
      success: true,
      review: review
        ? {
            id: review.id,
            rating: review.rating,
            review: review.review,
            isApproved: review.isApproved,
            createdAt: review.createdAt,
            updatedAt: review.updatedAt,
          }
        : null,
    };
  }

  /**
   * Submit or update rating and review for a specific property (logged in end users only)
   * propertyId comes from path param; body contains role, ratings, and optional text.
   */
  async submitPropertyRatingReview(
    endUserId: string,
    propertyId: string,
    dto: SubmitPropertyRatingReviewBodyDto,
  ): Promise<SubmitPropertyRatingReviewResponseDto> {
    const {
      role,
      connectivityRating,
      neighbourhoodRating,
      safetyRating,
      livabilityRating,
      likeText,
      dislikeText,
    } = dto;

    // Verify the user exists and is an end user
    const user = await this.userRepository.findById(endUserId);
    if (!user) {
      throw new BadRequestException('User not found');
    }
    // Verify the property exists and is active
    const property = await this.propertyRepository.findById(propertyId);
    if (!property || property.isDeleted || property.status !== PropertyStatus.ACTIVE) {
      throw new BadRequestException('Property is not available');
    }

    // Compute overall rating as average of the four categories
    const overallRating =
      (connectivityRating +
        neighbourhoodRating +
        safetyRating +
        livabilityRating) /
      4;

    const saved = await this.propertyRatingReviewRepository.upsertForUser(
      propertyId,
      endUserId,
      role,
      {
        connectivityRating,
        neighbourhoodRating,
        safetyRating,
        livabilityRating,
        likeText: likeText ?? null,
        dislikeText: dislikeText ?? null,
        overallRating,
      },
    );

    return {
      success: true,
      message: 'Property rating and review submitted successfully',
      ratingReviewId: saved.id,
    };
  }

  /**
   * Get logged-in user's rating and review for a specific property
   */
  async getMyPropertyRatingReview(
    endUserId: string,
    propertyId: string,
  ): Promise<GetMyPropertyRatingReviewResponseDto> {
    // Ensure user exists (cheap safety check)
    const user = await this.userRepository.findById(endUserId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const review =
      await this.propertyRatingReviewRepository.findByUserAndProperty(
        propertyId,
        endUserId,
      );

    if (!review) {
      return {
        success: true,
        review: null,
      };
    }

    return {
      success: true,
      review: {
        propertyId: review.propertyId,
        role: review.role,
        connectivityRating: review.connectivityRating,
        neighbourhoodRating: review.neighbourhoodRating,
        safetyRating: review.safetyRating,
        livabilityRating: review.livabilityRating,
        likeText: review.likeText ?? undefined,
        dislikeText: review.dislikeText ?? undefined,
      },
    };
  }

  /**
   * Get rating and reviews for a specific property (summary, feature ratings, whats good/bad, paginated reviews)
   */
  async getPropertyRatingReviews(
    propertyId: string,
    query: GetPropertyRatingReviewsQueryDto,
  ): Promise<GetPropertyRatingReviewsResponseDto> {
    const property = await this.propertyRepository.findById(propertyId);
    if (
      !property ||
      property.isDeleted ||
      property.status !== PropertyStatus.ACTIVE
    ) {
      throw new BadRequestException('Property is not available');
    }

    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(50, Math.max(1, query.limit ?? 10));
    const sortBy = query.sortBy ?? 'recommended';

    const [stats, { likes, dislikes }, { items: reviews, total }] =
      await Promise.all([
        this.propertyRatingReviewRepository.getRatingStatistics(propertyId),
        this.propertyRatingReviewRepository.getLikeDislikeTexts(propertyId),
        this.propertyRatingReviewRepository.findByPropertyPaginated(
          propertyId,
          page,
          limit,
          {
            search: query.q?.trim() || undefined,
            rating: query.rating,
            sortBy,
          },
        ),
      ]);

    const whatsGood = this.dedupeTrimStrings(likes);
    const whatsBad = this.dedupeTrimStrings(dislikes);

    const totalPages = Math.max(1, Math.ceil(total / limit));

    return {
      success: true,
      summary: {
        averageRating: stats.averageOverallRating,
        totalReviews: stats.totalReviews,
        starDistribution: stats.starDistribution,
      },
      featureRatings: {
        connectivity: stats.averageConnectivityRating,
        neighbourhood: stats.averageNeighbourhoodRating,
        safety: stats.averageSafetyRating,
        livability: stats.averageLivabilityRating,
      },
      whatsGood,
      whatsBad,
      reviews: reviews.map((r) => ({
        id: r.id,
        reviewerName: r.endUser?.name ?? 'Anonymous',
        reviewerProfileImage: r.endUser?.profileImage ?? null,
        reviewerDetail: r.endUser?.aboutYourSelf ?? null,
        overallRating: Number(r.overallRating),
        role: r.role,
        likeText: r.likeText ?? null,
        dislikeText: r.dislikeText ?? null,
        createdAt: r.createdAt,
      })),
      page,
      limit,
      total,
      totalPages,
    };
  }

  private dedupeTrimStrings(arr: string[]): string[] {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const s of arr) {
      const t = s.trim();
      if (!t) continue;
      const key = t.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(t);
    }
    return out;
  }

  /**
   * Get property master data (listing types, categories, property types, and amenities)
   * Structure: Listing Types -> Categories -> Property Types; plus flat list of amenities
   */
  async getPropertyMasterData(): Promise<PropertyMasterDataResponseDto> {
    return this.cache.getOrSet(
      'master:property-master-data',
      10 * 60_000,
      () => this.computePropertyMasterData(),
    );
  }

  private async computePropertyMasterData(): Promise<PropertyMasterDataResponseDto> {
    // Fetch all listing types, categories, property types, and amenities in parallel
    const [listingTypes, categories, propertyTypes, amenities] = await Promise.all([
      this.propertyListingTypeRepository.findAll(),
      this.propertyCategoryRepository.findAll(),
      this.propertyTypeRepository.findAll(),
      this.amenityRepository.findAll(),
    ]);

    // Build the hierarchical structure
    const listingTypeItems: ListingTypeItemDto[] = listingTypes.map(
      (listingType) => {
        // For each listing type, get categories that have property types for this listing type
        const categoryMap = new Map<string, CategoryItemDto>();

        // Filter property types for this listing type
        const propertyTypesForListingType = propertyTypes.filter(
          (pt) => pt.listingTypeId === listingType.id,
        );

        // Group property types by category
        propertyTypesForListingType.forEach((propertyType) => {
          const categoryId = propertyType.categoryId;

          if (!categoryMap.has(categoryId)) {
            const category = categories.find((c) => c.id === categoryId);
            if (category) {
              categoryMap.set(categoryId, {
                id: category.id,
                name: category.name,
                code: category.code,
                propertyTypes: [],
              });
            }
          }

          const categoryItem = categoryMap.get(categoryId);
          if (categoryItem) {
            categoryItem.propertyTypes.push({
              id: propertyType.id,
              name: propertyType.name,
              code: propertyType.code,
            });
          }
        });

        // Convert map to array and filter out categories with no property types
        const categoryItems = Array.from(categoryMap.values()).filter(
          (cat) => cat.propertyTypes.length > 0,
        );

        return {
          id: listingType.id,
          name: listingType.name,
          code: listingType.code,
          categories: categoryItems,
        };
      },
    );

    // Filter out listing types with no categories
    const filteredListingTypes = listingTypeItems.filter(
      (lt) => lt.categories.length > 0,
    );

    const amenityItems: AmenityItemDto[] = amenities.map((a) => ({
      id: a.id,
      name: a.name,
      code: a.code,
      icon: a.icon ?? null,
    }));

    return {
      success: true,
      message: 'Property master data retrieved successfully',
      data: filteredListingTypes,
      amenities: amenityItems,
    };
  }

  /**
   * List filters for property search: listing types, categories, property types, and BHK types.
   * Optional query params listingTypeId and categoryId filter property types.
   * When propertyTypeId is provided, bhkTypes are returned for that property type; bhkTypes are empty for Plot and Commercial category.
   */
  async getListFilters(query: ListFiltersQueryDto): Promise<ListFiltersResponseDto> {
    const cacheKey = `master:list-filters:${query.listingTypeId ?? ''}:${query.categoryId ?? ''}:${query.propertyTypeId ?? ''}`;
    return this.cache.getOrSet(cacheKey, 5 * 60_000, () => this.computeListFilters(query));
  }

  private async computeListFilters(query: ListFiltersQueryDto): Promise<ListFiltersResponseDto> {
    const [listingTypes, categories, propertyTypes, amenities] = await Promise.all([
      this.propertyListingTypeRepository.findAll(),
      this.propertyCategoryRepository.findAll(),
      this.propertyTypeRepository.findAll(),
      this.amenityRepository.findAll(),
    ]);

    let filteredPropertyTypes = propertyTypes;
    if (query.listingTypeId) {
      filteredPropertyTypes = filteredPropertyTypes.filter(
        (pt) => pt.listingTypeId === query.listingTypeId,
      );
    }
    if (query.categoryId) {
      filteredPropertyTypes = filteredPropertyTypes.filter(
        (pt) => pt.categoryId === query.categoryId,
      );
    }

    let bhkTypes: { id: string; name: string; code: string }[] = [];
    if (query.propertyTypeId) {
      const propertyType = await this.propertyTypeRepository.findById(query.propertyTypeId);
      const isPlot = propertyType?.name?.toLowerCase() === 'plot';
      const category = propertyType
        ? await this.propertyCategoryRepository.findById(propertyType.categoryId)
        : null;
      const isCommercial = category?.code?.toLowerCase() === 'commercial';
      if (!isPlot && !isCommercial && propertyType) {
        const bhkList = await this.bhkTypeRepository.findByPropertyTypeId(query.propertyTypeId);
        bhkTypes = bhkList.map((b) => ({ id: b.id, name: b.name, code: b.code }));
      }
    } else {
      const bhkList = await this.bhkTypeRepository.findAll();
      bhkTypes = bhkList.map((b) => ({ id: b.id, name: b.name, code: b.code }));
    }

    return {
      success: true,
      listingTypes: listingTypes.map((lt) => ({
        id: lt.id,
        name: lt.name,
        code: lt.code,
      })),
      categories: categories.map((c) => ({
        id: c.id,
        name: c.name,
        code: c.code,
      })),
      propertyTypes: filteredPropertyTypes.map((pt) => ({
        id: pt.id,
        name: pt.name,
        code: pt.code,
      })),
      bhkTypes,
      amenities: amenities.map((a) => ({
        id: a.id,
        name: a.name,
        code: a.code,
        icon: a.icon ?? null,
      })),
      furnishing: [
        { id: 'Furnished', name: 'Furnished', code: 'Furnished' },
        { id: 'Semi-Furnished', name: 'Semi-Furnished', code: 'Semi-Furnished' },
        { id: 'Unfurnished', name: 'Unfurnished', code: 'Unfurnished' },
      ],
      budgetSale: {
        unit: '₹ Crore',
        min: [
          { label: 'Min', value: 0 },
          { label: '₹ 0.5 Cr', value: 5000000 },
          { label: '₹ 1 Cr', value: 10000000 },
          { label: '₹ 1.4 Cr', value: 14000000 },
          { label: '₹ 2 Cr', value: 20000000 },
          { label: '₹ 5 Cr', value: 50000000 },
          { label: '₹ 10 Cr', value: 100000000 },
          { label: '₹ 20 Cr', value: 200000000 },
        ],
        max: [
          { label: 'Max', value: 0 },
          { label: '₹ 0.5 Cr', value: 5000000 },
          { label: '₹ 1 Cr', value: 10000000 },
          { label: '₹ 1.4 Cr', value: 14000000 },
          { label: '₹ 2 Cr', value: 20000000 },
          { label: '₹ 5 Cr', value: 50000000 },
          { label: '₹ 10 Cr', value: 100000000 },
          { label: '₹ 20 Cr', value: 200000000 },
          { label: '₹ 50 Cr+', value: 500000000 },
        ],
      },
      budgetRent: {
        unit: '₹ per month',
        min: [
          { label: 'Min', value: 0 },
          { label: '₹ 5 K', value: 5000 },
          { label: '₹ 10 K', value: 10000 },
          { label: '₹ 20 K', value: 20000 },
          { label: '₹ 30 K', value: 30000 },
          { label: '₹ 50 K', value: 50000 },
          { label: '₹ 1 Lakh', value: 100000 },
          { label: '₹ 2 Lakh', value: 200000 },
        ],
        max: [
          { label: 'Max', value: 0 },
          { label: '₹ 10 K', value: 10000 },
          { label: '₹ 20 K', value: 20000 },
          { label: '₹ 30 K', value: 30000 },
          { label: '₹ 50 K', value: 50000 },
          { label: '₹ 1 Lakh', value: 100000 },
          { label: '₹ 2 Lakh', value: 200000 },
          { label: '₹ 5 Lakh+', value: 500000 },
        ],
      },
      sizePlot: {
        unit: 'Sq. Yd.',
        min: [
          { label: 'Min', value: 0 },
          { label: '50 Sq.Yd.', value: 50 },
          { label: '100 Sq.Yd.', value: 100 },
          { label: '150 Sq.Yd.', value: 150 },
          { label: '200 Sq.Yd.', value: 200 },
          { label: '300 Sq.Yd.', value: 300 },
          { label: '500 Sq.Yd.', value: 500 },
          { label: '1000 Sq.Yd.', value: 1000 },
        ],
        max: [
          { label: 'Max', value: 0 },
          { label: '100 Sq.Yd.', value: 100 },
          { label: '200 Sq.Yd.', value: 200 },
          { label: '300 Sq.Yd.', value: 300 },
          { label: '500 Sq.Yd.', value: 500 },
          { label: '1000 Sq.Yd.', value: 1000 },
          { label: '2000 Sq.Yd.', value: 2000 },
          { label: '5000 Sq.Yd.+', value: 5000 },
        ],
      },
      sizeBuiltUp: {
        unit: 'Sq. Ft.',
        min: [
          { label: 'Min', value: 0 },
          { label: '500 Sq.Ft.', value: 500 },
          { label: '800 Sq.Ft.', value: 800 },
          { label: '1000 Sq.Ft.', value: 1000 },
          { label: '1500 Sq.Ft.', value: 1500 },
          { label: '2000 Sq.Ft.', value: 2000 },
          { label: '3000 Sq.Ft.', value: 3000 },
          { label: '5000 Sq.Ft.', value: 5000 },
        ],
        max: [
          { label: 'Max', value: 0 },
          { label: '1000 Sq.Ft.', value: 1000 },
          { label: '1500 Sq.Ft.', value: 1500 },
          { label: '2000 Sq.Ft.', value: 2000 },
          { label: '3000 Sq.Ft.', value: 3000 },
          { label: '5000 Sq.Ft.', value: 5000 },
          { label: '10000 Sq.Ft.+', value: 10000 },
        ],
      },
    };
  }

  /**
   * Get home page reviews (top 5 approved reviews with statistics)
   */
  async getHomePageReviews(): Promise<HomePageReviewsResponseDto> {
    const [reviews, statistics, totalEndUsers, ratingDistribution] = await Promise.all([
      this.kmaRatingReviewRepository.findTopApprovedReviews(50),
      this.kmaRatingReviewRepository.getApprovedReviewsStatistics(),
      // Count total end users (active, non-blocked)
      this.dataSource
        .getRepository(User)
        .count({
          where: {
            role: UserRole.END_USER,
            isActive: true,
            isBlocked: false,
          },
        }),
      this.kmaRatingReviewRepository.getApprovedRatingDistribution(),
    ]);

    // Defensive dedupe: if the table has stray duplicate rows for the same
    // end user (one-review-per-user is enforced going forward but old data
    // may have leftovers), keep only the most-recent row per endUserId so
    // the public page never shows the same person twice.
    const seenEndUsers = new Set<string>();
    const dedupedReviews = reviews.filter((r) => {
      if (!r.endUserId) return true; // keep phone-only / legacy rows as-is
      if (seenEndUsers.has(r.endUserId)) return false;
      seenEndUsers.add(r.endUserId);
      return true;
    });

    const reviewItems: HomePageReviewItemDto[] = dedupedReviews.map((r) => {
      const profileImage = r.endUser?.profileImage ?? null;
      return {
        id: r.id,
        rating: r.rating,
        review: r.review,
        name: r.name,
        email: r.email,
        endUser: r.endUser
          ? {
              id: r.endUser.id,
              name: r.endUser.name,
              email: r.endUser.email,
              profileImage: r.endUser.profileImage,
            }
          : null,
        profileImage,
        createdAt: r.createdAt,
      };
    });

    return {
      success: true,
      reviews: reviewItems,
      statistics: {
        totalCount: statistics.totalCount,
        averageRating: statistics.averageRating,
        totalEndUsers,
        ratingDistribution,
      },
      trustedByText: 'Trusted By Client around the World',
    };
  }

  /**
   * Get home page data including About Us and statistics
   */
  async getHomePageData(): Promise<HomePageResponseDto> {
    // Get About Us data (latest entry)
    const aboutUsEntries = await this.aboutUsRepository.findAll();
    const aboutUs: AboutUsDataDto | null =
      aboutUsEntries.length > 0
        ? {
            heading: aboutUsEntries[0].heading,
            description: aboutUsEntries[0].description,
          }
        : null;

    // Calculate 24 hours ago
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    // Get statistics in parallel
    const [
      totalOwners,
      totalChannelPartners,
      totalUsers,
      totalActiveProperties,
      propertiesListedLast24Hours,
    ] = await Promise.all([
      // Total Owners
      this.dataSource
        .getRepository(User)
        .count({
          where: {
            role: UserRole.OWNER,
            isActive: true,
            isBlocked: false,
          },
        }),
      // Total Channel Partners
      this.dataSource
        .getRepository(User)
        .count({
          where: {
            role: UserRole.CHANNEL_PARTNER,
            isActive: true,
            isBlocked: false,
          },
        }),
      // Total Users/Clients (end users only - active, non-blocked)
      this.dataSource
        .getRepository(User)
        .count({
          where: {
            role: UserRole.END_USER,
            isActive: true,
            isBlocked: false,
          },
        }),
      // Total Active Properties
      this.dataSource
        .getRepository(Property)
        .count({
          where: {
            status: PropertyStatus.ACTIVE,
            isDeleted: false,
          },
        }),
      // Properties listed in last 24 hours (active properties approved in last 24 hours)
      this.dataSource
        .getRepository(Property)
        .createQueryBuilder('property')
        .where('property.status = :status', { status: PropertyStatus.ACTIVE })
        .andWhere('property.activatedAt >= :date', { date: twentyFourHoursAgo })
        .andWhere('property.isDeleted = :isDeleted', { isDeleted: false })
        .getCount(),
    ]);

    return {
      success: true,
      aboutUs,
      statistics: {
        totalOwners,
        totalChannelPartners,
        totalUsers,
        totalActiveProperties,
        propertiesListedLast24Hours,
      },
    };
  }

  /**
   * Get property types with their active property counts for explore section
   */
  async getPropertyTypesExplore(
    query?: PropertyTypeExploreQueryDto,
  ): Promise<PropertyTypeExploreResponseDto> {
    const { cityId, propertyTypeId, listingTypeId } = query || {};

    // Get property types with filters
    let propertyTypes = await this.propertyTypeRepository.findAll();

    // Filter by listing type if provided
    if (listingTypeId) {
      propertyTypes = propertyTypes.filter(
        (pt) => pt.listingTypeId === listingTypeId,
      );
    }

    // Filter by specific property type if provided
    if (propertyTypeId) {
      propertyTypes = propertyTypes.filter((pt) => pt.id === propertyTypeId);
    }

    // Get property counts and sample images for each property type in parallel
    const propertyTypesWithCounts = await Promise.all(
      propertyTypes.map(async (propertyType) => {
        // Build where clause for property count and sample image
        const whereClause: any = {
          propertyTypeId: propertyType.id,
          status: PropertyStatus.ACTIVE,
          isDeleted: false,
        };

        if (cityId) whereClause.cityId = cityId;
        if (listingTypeId) whereClause.listingTypeId = listingTypeId;

        const [propertyCount, sampleProperty] = await Promise.all([
          this.dataSource.getRepository(Property).count({ where: whereClause }),
          this.propertyRepository.findOneActiveWithPhotosByPropertyType(
            propertyType.id,
            { cityId: cityId ?? undefined, listingTypeId: listingTypeId ?? undefined },
          ),
        ]);

        let imageUrl: string | null = null;
        let images: { fileKey: string; view: string; isCoverImage: boolean }[] | undefined;
        const sampleApprovedPhotos = this.filterApprovedPhotos(sampleProperty?.photos);
        if (sampleApprovedPhotos.length > 0) {
          const cover = sampleApprovedPhotos.find((p) => p.isCoverImage);
          const first = sampleApprovedPhotos[0];
          const selectedKey = (cover || first).fileKey;
          imageUrl = selectedKey ? this.s3Service.generateFileUrl(selectedKey) : null;
          images = sampleApprovedPhotos.map((p) => ({
            fileKey: p.fileKey,
            url: p.fileKey ? this.s3Service.generateFileUrl(p.fileKey) : null,
            view: p.view,
            isCoverImage: p.isCoverImage ?? false,
          }));
        }

        return {
          id: propertyType.id,
          name: propertyType.name,
          code: propertyType.code,
          propertyCount,
          imageUrl: imageUrl ?? undefined,
          images,
        };
      }),
    );

    // Filter out property types with 0 properties and sort by count descending
    const filteredAndSorted = propertyTypesWithCounts
      .filter((item) => item.propertyCount > 0)
      .sort((a, b) => b.propertyCount - a.propertyCount);

    return {
      success: true,
      propertyTypes: filteredAndSorted,
    };
  }

  /**
   * Get activity counts for the user panel (Recently Search, Recently Viewed, Saved Properties, Contacted Properties).
  /**
   * Get nearby places of a given type around a lat/lng coordinate.
   * Used by property detail page "Locality" section (Schools, Hospitals, Gyms, Restaurants, etc.)
   */
  async getNearbyPlaces(
    latitude: number,
    longitude: number,
    type: string,
    radius: number = 2000,
  ): Promise<{ success: boolean; places: { name: string; distance: string; address: string | null }[] }> {
    const places = await this.googlePlacesService.searchNearbyPlaces(
      latitude,
      longitude,
      type,
      radius,
    );
    return { success: true, places };
  }

  /**
   * For logged-in users: use userId from auth; all counts by userId.
   * For non-logged-in users: use X-Session-Id header; recentlySearch and recentlyViewed by session; savedProperties and contactedProperties are 0.
   */
  async getActivityCounts(
    sessionId: string | null,
    userId: string | null,
  ): Promise<UserActivityCountsResponseDto> {
    const isLoggedIn = !!userId;

    if (isLoggedIn) {
      const [recentlySearch, recentlyViewed, savedProperties, contactedProperties] =
        await Promise.all([
          this.searchHistoryRepository.countByUser(userId),
          this.seenPropertyRepository.getUniquePropertyCountByUser(userId),
          this.favoritePropertyRepository.countByUserId(userId),
          this.contactedPropertyRepository.countByUserId(userId),
        ]);
      return {
        recentlySearch,
        recentlyViewed,
        savedProperties,
        contactedProperties,
      };
    }

    // Non-logged-in: use sessionId for search, viewed, and contacted; saved is 0
    let recentlySearch = 0;
    let recentlyViewed = 0;
    let contactedProperties = 0;
    if (sessionId) {
      [recentlySearch, recentlyViewed, contactedProperties] = await Promise.all([
        this.searchHistoryRepository.countBySession(sessionId),
        this.seenPropertyRepository.getUniquePropertyCountBySession(sessionId),
        this.contactedPropertyRepository.countBySession(sessionId),
      ]);
    }
    return {
      recentlySearch,
      recentlyViewed,
      savedProperties: 0,
      contactedProperties,
    };
  }

  /**
   * Map a property entity to the standard list item DTO
   */
  private mapPropertyToListItem(
    property: any,
    rating?: { averageRating: number | null; totalReviews: number },
  ): EndUserPropertyListItemDto {
    // Filter to only approved media, then get primary image and all images
    const approvedPhotos = this.filterApprovedPhotos(property.photos);
    const approvedVideos = this.filterApprovedVideos(property.videos);
    let imageUrl: string | null = null;
    let images: EndUserPropertyImageDto[] | undefined = undefined;
    if (approvedPhotos.length > 0) {
      const coverImage = approvedPhotos.find((p) => p.isCoverImage);
      const firstPhoto = approvedPhotos[0];
      const selectedPhoto = coverImage || firstPhoto;
      imageUrl = selectedPhoto.fileKey ? this.s3Service.generateFileUrl(selectedPhoto.fileKey) : null;
      images = approvedPhotos.map((photo) => ({
        fileKey: photo.fileKey,
        url: photo.fileKey ? this.s3Service.generateFileUrl(photo.fileKey) : null,
        view: photo.view,
        isCoverImage: photo.isCoverImage || false,
      }));
    }

    // Map all approved videos
    let videos: EndUserPropertyVideoDto[] | undefined = undefined;
    if (approvedVideos.length > 0) {
      videos = approvedVideos.map((video) => ({
        fileKey: video.fileKey,
        url: video.fileKey ? this.s3Service.generateFileUrl(video.fileKey) : null,
        format: video.format,
      }));
    }

    // Build address
    const addressParts: string[] = [];
    if (property.society?.name) addressParts.push(property.society.name);
    if (property.locality?.name) addressParts.push(property.locality.name);
    if (property.city?.name) addressParts.push(property.city.name);
    const address = addressParts.join(', ') || 'Address not available';

    const propertyName =
      property.society?.name ||
      property.propertyDescription?.split('.')[0] ||
      'Property';

    // Build units array
    const units: EndUserPropertyUnitDto[] = [];
    if (property.bhkType?.name) {
      const builtUpAreaMetadata =
        property.builtUpAreaMetadata || (property as any).builtUpAreaMetadata;
      if (builtUpAreaMetadata) {
        const superBuiltUpArea = builtUpAreaMetadata.superBuiltUpArea
          ? `${builtUpAreaMetadata.superBuiltUpArea} Sq. Ft.`
          : builtUpAreaMetadata.carpetArea
            ? `${builtUpAreaMetadata.carpetArea} Sq. Ft.`
            : 'Size not available';
        const price =
          property.price != null
            ? `₹ ${property.price.toLocaleString('en-IN')}`
            : property.monthlyRent != null
              ? `₹ ${property.monthlyRent.toLocaleString('en-IN')}/month`
              : 'Price On Request';
        units.push({
          unit: property.bhkType.name,
          size: `${superBuiltUpArea} (Saleable)`,
          price,
        });
      }
    }

    return {
      id: property.id,
      propertyName,
      address,
      description: property.propertyDescription || undefined,
      imageUrl,
      images,
      videos,
      imageCount: approvedPhotos.length,
      videoCount: approvedVideos.length,
      isReraRegistered: false,
      constructionStatus: property.constructionStatus || null,
      categoryId: property.category?.id ?? null,
      category: property.category?.name || null,
      listingTypeId: property.listingType?.id ?? null,
      listingType: property.listingType?.name || null,
      propertyTypeId: property.propertyType?.id ?? null,
      propertyType: property.propertyType?.name || null,
      bhkTypeId: property.bhkType?.id ?? null,
      bhkType: property.bhkType?.name || null,
      plotArea: property.plotArea || null,
      plotAreaUnit: property.plotAreaUnit || null,
      facing: property.facing || null,
      furnishType: property.furnishType || null,
      price: property.price || null,
      monthlyRent: property.monthlyRent || null,
      city: property.city?.name || null,
      society: property.society?.name || null,
      locality: property.locality?.name || null,
      units: units.length > 0 ? units : undefined,
      owner: property.user
        ? {
            name: property.user.name,
            profileImage: property.user.profileImage
              ? this.s3Service.generateFileUrl(property.user.profileImage)
              : null,
            role: property.user.role,
          }
        : null,
      averageRating: rating?.averageRating && rating.averageRating > 0 ? rating.averageRating : null,
      totalReviews: rating?.totalReviews ?? 0,
    } as EndUserPropertyListItemDto;
  }

  /**
   * Get ratings map for a list of property IDs
   */
  private async getRatingsMapForProperties(
    propertyIds: string[],
  ): Promise<Map<string, { averageRating: number | null; totalReviews: number }>> {
    const map = new Map<string, { averageRating: number | null; totalReviews: number }>();
    for (const id of propertyIds) {
      const stats = await this.propertyRatingReviewRepository.getRatingStatistics(id);
      map.set(id, {
        averageRating: stats.averageOverallRating,
        totalReviews: stats.totalReviews,
      });
    }
    return map;
  }

  /**
   * Get recently viewed properties list
   */
  async getRecentlyViewed(
    sessionId: string | null,
    userId: string | null,
    query: ActivityListQueryDto,
  ): Promise<RecentlyViewedListResponseDto> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    let result: { items: any[]; total: number };

    if (userId) {
      result = await this.seenPropertyRepository.findByUserWithProperties(userId, page, limit, query.listingType, query.sort);
    } else if (sessionId) {
      result = await this.seenPropertyRepository.findBySessionWithProperties(sessionId, page, limit, query.listingType, query.sort);
    } else {
      result = { items: [], total: 0 };
    }

    const validItems = result.items.filter((item) => item.property);
    const propertyIds = validItems.map((item) => item.property.id);
    const ratingsMap = await this.getRatingsMapForProperties(propertyIds);
    const properties = validItems.map((item) =>
      this.mapPropertyToListItem(item.property, ratingsMap.get(item.property.id)),
    );

    return {
      success: true,
      properties,
      total: result.total,
      page,
      limit,
      totalPages: Math.ceil(result.total / limit),
    };
  }

  /**
   * Get recently searched list
   */
  async getRecentlySearched(
    sessionId: string | null,
    userId: string | null,
    query: GetSearchHistoryQueryDto,
  ): Promise<GetSearchHistoryResponseDto> {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const sortBy = query.sortBy || 'recent';
    const listingType = query.listingType || undefined;
    let result: { data: any[]; total: number };

    if (userId) {
      result = await this.searchHistoryRepository.findByUser(userId, page, limit, sortBy, listingType);
    } else if (sessionId) {
      result = await this.searchHistoryRepository.findBySession(sessionId, page, limit, sortBy, listingType);
    } else {
      result = { data: [], total: 0 };
    }

    const searches: SearchHistoryItemDto[] = result.data.map((item) => ({
      id: item.id,
      searchQuery: item.searchQuery,
      location: item.location || undefined,
      city: item.city || undefined,
      priceRange: item.priceRange || undefined,
      filters: item.filters || undefined,
      createdAt: item.createdAt,
    }));

    return {
      searches,
      total: result.total,
      page,
      limit,
      totalPages: Math.ceil(result.total / limit),
    };
  }

  /**
   * Get contacted properties list
   */
  async getContactedProperties(
    sessionId: string | null,
    userId: string | null,
    query: ActivityListQueryDto,
  ): Promise<ContactedPropertiesListResponseDto> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    let result: { items: any[]; total: number };

    if (userId) {
      result = await this.contactedPropertyRepository.findByUserWithProperties(userId, page, limit, query.listingType, query.sort);
    } else if (sessionId) {
      result = await this.contactedPropertyRepository.findBySessionWithProperties(sessionId, page, limit, query.listingType, query.sort);
    } else {
      result = { items: [], total: 0 };
    }

    const validItems = result.items.filter((item) => item.property);
    const propertyIds = validItems.map((item) => item.property.id);
    const ratingsMap = await this.getRatingsMapForProperties(propertyIds);
    const properties = validItems.map((item) =>
      this.mapPropertyToListItem(item.property, ratingsMap.get(item.property.id)),
    );

    return {
      success: true,
      properties,
      total: result.total,
      page,
      limit,
      totalPages: Math.ceil(result.total / limit),
    };
  }

  /**
   * Get all reviews submitted by the logged-in user (My Reviews page)
   */
  async getMyReviews(
    userId: string,
    query: { page?: number; limit?: number; sort?: string },
  ) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const sort = query.sort || 'newest';

    const result = await this.propertyRatingReviewRepository.findByEndUser(userId, page, limit, sort);

    const reviews = result.items.map((review) => {
      const property = review.property;
      let propertyName = 'Property';
      let propertyAddress: string | null = null;
      let propertyImageUrl: string | null = null;

      if (property) {
        propertyName = property.society?.name || property.propertyDescription?.split('.')[0] || 'Property';

        const addrParts: string[] = [];
        if (property.society?.name) addrParts.push(property.society.name);
        if (property.locality?.name) addrParts.push(property.locality.name);
        if (property.city?.name) addrParts.push(property.city.name);
        propertyAddress = addrParts.length > 0 ? addrParts.join(', ') : null;

        const approvedPhotos = this.filterApprovedPhotos(property.photos);
        if (approvedPhotos.length > 0) {
          const cover = approvedPhotos.find((p) => p.isCoverImage);
          const first = approvedPhotos[0];
          const key = (cover || first).fileKey;
          propertyImageUrl = key ? this.s3Service.generateFileUrl(key) : null;
        }
      }

      return {
        id: review.id,
        propertyId: review.propertyId,
        propertyName,
        propertyAddress,
        propertyImageUrl,
        overallRating: Number(review.overallRating),
        connectivityRating: review.connectivityRating,
        neighbourhoodRating: review.neighbourhoodRating,
        safetyRating: review.safetyRating,
        livabilityRating: review.livabilityRating,
        likeText: review.likeText,
        dislikeText: review.dislikeText,
        role: review.role,
        createdAt: review.createdAt,
      };
    });

    return {
      success: true,
      reviews,
      total: result.total,
      page,
      limit,
      totalPages: Math.ceil(result.total / limit),
    };
  }

  async getAdminConfigurations(): Promise<EndUserConfigurationResponseDto> {
    const configuration = await this.adminConfigurationRepository.findOne();

    if (!configuration) {
      return {
        success: true,
        configuration: null,
      };
    }

    return {
      success: true,
      configuration: {
        id: configuration.id,
        mobileAppAvailable: configuration.mobileAppAvailable,
        description: configuration.description,
        phoneNumber: configuration.phoneNumber,
        email: configuration.email,
        address: configuration.address,
        latitude: configuration.latitude ? Number(configuration.latitude) : null,
        longitude: configuration.longitude ? Number(configuration.longitude) : null,
        instagramLink: configuration.instagramLink,
        fbLink: configuration.fbLink,
        youtubeLink: configuration.youtubeLink,
        twitterLink: configuration.twitterLink,
        createdAt: configuration.createdAt,
        updatedAt: configuration.updatedAt,
      },
    };
  }

  /**
   * Add property to favorites
   */
  async addFavoriteProperty(
    userId: string,
    dto: AddFavoritePropertyDto,
  ): Promise<FavoritePropertyResponseDto> {
    const { propertyId } = dto;

    // Check if property exists and is active
    const property = await this.propertyRepository.findById(propertyId);
    if (!property) {
      throw new BadRequestException('Property not found');
    }

    if (property.status !== PropertyStatus.ACTIVE || property.isDeleted) {
      throw new BadRequestException('Property is not available');
    }

    // Check if already favorited
    const existing = await this.favoritePropertyRepository.findByUserAndProperty(
      userId,
      propertyId,
    );
    if (existing) {
      throw new BadRequestException('Property is already in favorites');
    }

    const favorite = await this.favoritePropertyRepository.create(
      userId,
      propertyId,
    );

    return {
      success: true,
      message: 'Property added to favorites successfully',
      favoriteId: favorite.id,
    };
  }

  /**
   * Remove property from favorites
   */
  async removeFavoriteProperty(
    userId: string,
    dto: RemoveFavoritePropertyDto,
  ): Promise<FavoritePropertyResponseDto> {
    const { propertyId } = dto;

    const deleted = await this.favoritePropertyRepository.delete(
      userId,
      propertyId,
    );

    if (!deleted) {
      throw new BadRequestException('Property is not in favorites');
    }

    return {
      success: true,
      message: 'Property removed from favorites successfully',
    };
  }

  /**
   * Get user's favorite properties
   */
  async getFavoriteProperties(
    userId: string,
    query: FavoritePropertyListQueryDto,
  ): Promise<FavoritePropertyListResponseDto> {
    const { page, limit } = query;

    const result = await this.favoritePropertyRepository.findByUserId(
      userId,
      page,
      limit,
      query.listingType,
      query.sort,
    );

    // Map favorite properties to response DTO (reuse the same mapping logic as searchEndUserProperties)
    const properties: EndUserPropertyListItemDto[] = result.items.map(
      (favorite) => {
        const property = favorite.property;

        // Filter to only approved media, then get primary image and all images
        const approvedPhotos = this.filterApprovedPhotos(property.photos);
        const approvedVideos = this.filterApprovedVideos(property.videos);
        let imageUrl: string | null = null;
        let images: EndUserPropertyImageDto[] | undefined = undefined;
        if (approvedPhotos.length > 0) {
          const coverImage = approvedPhotos.find((p) => p.isCoverImage);
          const firstPhoto = approvedPhotos[0];
          const selectedPhoto = coverImage || firstPhoto;
          imageUrl = selectedPhoto.fileKey ? this.s3Service.generateFileUrl(selectedPhoto.fileKey) : null;

          // Map all approved images
          images = approvedPhotos.map((photo) => ({
            fileKey: photo.fileKey,
            url: photo.fileKey ? this.s3Service.generateFileUrl(photo.fileKey) : null,
            view: photo.view,
            isCoverImage: photo.isCoverImage || false,
          }));
        }

        // Map all approved videos
        let videos: EndUserPropertyVideoDto[] | undefined = undefined;
        if (approvedVideos.length > 0) {
          videos = approvedVideos.map((video) => ({
            fileKey: video.fileKey,
            url: video.fileKey ? this.s3Service.generateFileUrl(video.fileKey) : null,
            format: video.format,
          }));
        }

        // Build address
        const addressParts: string[] = [];
        if (property.society?.name) {
          addressParts.push(property.society.name);
        }
        if (property.locality?.name) {
          addressParts.push(property.locality.name);
        }
        if (property.city?.name) {
          addressParts.push(property.city.name);
        }
        const address = addressParts.join(', ') || 'Address not available';

        // Build property name (use society name or property description)
        const propertyName =
          property.society?.name ||
          property.propertyDescription?.split('.')[0] ||
          'Property';

        // Build units array
        const units: EndUserPropertyUnitDto[] = [];
        if (property.bhkType?.name) {
          // Try to get builtUpAreaMetadata from relations if available
          const builtUpAreaMetadata = property.builtUpAreaMetadata || 
            (property as any).builtUpAreaMetadata;
          
          if (builtUpAreaMetadata) {
            const superBuiltUpArea = builtUpAreaMetadata.superBuiltUpArea
              ? `${builtUpAreaMetadata.superBuiltUpArea} Sq. Ft.`
              : builtUpAreaMetadata.carpetArea
                ? `${builtUpAreaMetadata.carpetArea} Sq. Ft.`
                : 'Size not available';
            const price =
              property.price != null
                ? `₹ ${property.price.toLocaleString('en-IN')}`
                : property.monthlyRent != null
                  ? `₹ ${property.monthlyRent.toLocaleString('en-IN')}/month`
                  : 'Price On Request';

            units.push({
              unit: property.bhkType.name,
              size: `${superBuiltUpArea} (Saleable)`,
              price,
            });
          }
        }

        return {
          id: property.id,
          propertyName,
          address,
          description: property.propertyDescription || undefined,
          imageUrl,
          images: images,
          videos: videos,
          imageCount: approvedPhotos.length,
          videoCount: approvedVideos.length,
          isReraRegistered: false,
          constructionStatus: property.constructionStatus || null,
          categoryId: property.category?.id ?? null,
          category: property.category?.name || null,
          listingTypeId: property.listingType?.id ?? null,
          listingType: property.listingType?.name || null,
          propertyTypeId: property.propertyType?.id ?? null,
          propertyType: property.propertyType?.name || null,
          bhkTypeId: property.bhkType?.id ?? null,
          bhkType: property.bhkType?.name || null,
          plotArea: property.plotArea || null,
          plotAreaUnit: property.plotAreaUnit || null,
          facing: property.facing || null,
          furnishType: property.furnishType || null,
          price: property.price || null,
          monthlyRent: property.monthlyRent || null,
          city: property.city?.name || null,
          society: property.society?.name || null,
          locality: property.locality?.name || null,
          units: units.length > 0 ? units : undefined,
          owner: property.user
            ? {
                name: property.user.name,
                profileImage: property.user.profileImage,
                role: property.user.role,
              }
            : null,
        };
      },
    );

    const totalPages = Math.ceil(result.total / limit);

    return {
      success: true,
      properties,
      total: result.total,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * Check if property is favorited by user
   */
  async checkFavoriteProperty(
    userId: string,
    propertyId: string,
  ): Promise<CheckFavoritePropertyResponseDto> {
    const isFavorite = await this.favoritePropertyRepository.isFavorite(
      userId,
      propertyId,
    );

    return {
      success: true,
      isFavorite,
    };
  }

  // ─── OTHER SCREENS ──────────────────────────────────────────────

  /**
   * Get all team members for Meet the Team page
   */
  async getTeamMembers(): Promise<{
    success: boolean;
    teamMembers: any[];
    total: number;
  }> {
    const members = await this.teamMemberRepository.findAll();
    return {
      success: true,
      teamMembers: members.map((m) => ({
        id: m.id,
        name: m.name,
        role: m.role,
        email: m.email,
        phone: m.phone,
        profileImage: m.profileImage,
        description: m.description,
        isFounder: m.isFounder,
      })),
      total: members.length,
    };
  }

  /**
   * Get all regional offices for Sales Enquiry page
   */
  async getRegionalOffices(): Promise<{
    success: boolean;
    offices: any[];
    total: number;
  }> {
    const offices = await this.regionalOfficeRepository.findAll();
    return {
      success: true,
      offices: offices.map((o) => ({
        id: o.id,
        city: o.city,
        address: o.address,
        contactPerson: o.contactPerson,
        designation: o.designation,
        phone: o.phone,
        email: o.email,
      })),
      total: offices.length,
    };
  }

  /**
   * Get help center FAQs
   */
  async getHelpCenterFaqs(category?: string): Promise<{
    success: boolean;
    faqs: any[];
    total: number;
  }> {
    const faqs = await this.helpCenterFaqRepository.findAll(category);
    return {
      success: true,
      faqs: faqs.map((f) => ({
        id: f.id,
        question: f.question,
        answer: f.answer,
        category: f.category,
      })),
      total: faqs.length,
    };
  }

  // ─── Channel Partner Reviews ───────────────────────────────────────

  /**
   * Submit or update a review for a channel partner
   */
  async submitChannelPartnerReview(
    channelPartnerId: string,
    reviewerId: string,
    dto: SubmitCPReviewDto,
  ): Promise<SubmitCPReviewResponseDto> {
    // Verify reviewer exists
    const reviewer = await this.userRepository.findById(reviewerId);
    if (!reviewer) {
      throw new BadRequestException('User not found');
    }

    // Verify channel partner exists and is actually a channel partner
    const channelPartner = await this.userRepository.findById(channelPartnerId);
    if (!channelPartner) {
      throw new BadRequestException('Channel partner not found');
    }
    if (channelPartner.role !== UserRole.CHANNEL_PARTNER) {
      throw new BadRequestException('The specified user is not a channel partner');
    }

    // Cannot review yourself
    if (channelPartnerId === reviewerId) {
      throw new BadRequestException('You cannot review yourself');
    }

    const saved = await this.channelPartnerReviewRepository.upsert(
      channelPartnerId,
      reviewerId,
      dto.rating,
      dto.review ?? null,
    );

    return {
      success: true,
      message: 'Review submitted successfully',
      reviewId: saved.id,
    };
  }

  /**
   * Get paginated reviews for a channel partner with stats
   */
  async getChannelPartnerReviews(
    channelPartnerId: string,
    query: CPReviewsListQueryDto,
  ): Promise<CPReviewsListResponseDto> {
    // Verify channel partner exists and is actually a channel partner
    const channelPartner = await this.userRepository.findById(channelPartnerId);
    if (!channelPartner) {
      throw new BadRequestException('Channel partner not found');
    }
    if (channelPartner.role !== UserRole.CHANNEL_PARTNER) {
      throw new BadRequestException('The specified user is not a channel partner');
    }

    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(50, Math.max(1, query.limit ?? 10));
    const sortBy = query.sortBy ?? 'newest';

    const [{ averageRating, totalReviews }, starDistribution, { items: reviews, total }] =
      await Promise.all([
        this.channelPartnerReviewRepository.getAverageRating(channelPartnerId),
        this.channelPartnerReviewRepository.getStarDistribution(channelPartnerId),
        this.channelPartnerReviewRepository.findByChannelPartner(
          channelPartnerId,
          page,
          limit,
          sortBy,
        ),
      ]);

    const totalPages = Math.max(1, Math.ceil(total / limit));

    return {
      success: true,
      averageRating,
      totalReviews,
      starDistribution,
      reviews: reviews.map((r) => ({
        id: r.id,
        reviewerName: r.reviewer?.name ?? 'Anonymous',
        reviewerProfileImage: r.reviewer?.profileImage ?? null,
        rating: Number(r.rating),
        review: r.review ?? null,
        createdAt: r.createdAt,
      })),
      page,
      limit,
      total,
      totalPages,
    };
  }

  /**
   * Get the logged-in user's own review for a channel partner
   */
  async getMyChannelPartnerReview(
    reviewerId: string,
    channelPartnerId: string,
  ): Promise<GetMyCPReviewResponseDto> {
    const user = await this.userRepository.findById(reviewerId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const review = await this.channelPartnerReviewRepository.findByReviewerAndCP(
      reviewerId,
      channelPartnerId,
    );

    if (!review) {
      return {
        success: true,
        review: null,
      };
    }

    return {
      success: true,
      review: {
        id: review.id,
        rating: Number(review.rating),
        review: review.review ?? null,
        createdAt: review.createdAt,
      },
    };
  }

  /**
   * Unified search suggest — matches across cities, localities, societies.
   * Returns grouped results for main search bar autocomplete.
   */
  async searchSuggest(
    query: string,
    limit: number = 8,
    filters: {
      listingTypeId?: string;
      categoryId?: string;
      propertyTypeIds?: string;
    } = {},
  ): Promise<{
    success: boolean;
    cities: Array<{ id: string; name: string; state: string | null }>;
    localities: Array<{ id: string; name: string; cityId: string; cityName: string | null }>;
    societies: Array<{ id: string; name: string; cityId: string | null; cityName: string | null; localityId: string | null; localityName: string | null }>;
  }> {
    const q = (query || '').trim();
    if (q.length < 1) {
      return { success: true, cities: [], localities: [], societies: [] };
    }
    const like = `%${q}%`;
    const prefixLike = `${q}%`;
    const perTypeLimit = Math.min(20, Math.max(3, limit));

    // Build optional property-side filter clause
    const propFilters: string[] = [];
    const extraParams: any[] = [];
    let pIdx = 4; // base params are $1, $2, $3
    if (filters.listingTypeId) {
      propFilters.push(`p."listingTypeId" = $${pIdx++}`);
      extraParams.push(filters.listingTypeId);
    }
    if (filters.categoryId) {
      propFilters.push(`p."categoryId" = $${pIdx++}`);
      extraParams.push(filters.categoryId);
    }
    if (filters.propertyTypeIds) {
      const ids = filters.propertyTypeIds.split(',').map((s) => s.trim()).filter(Boolean);
      if (ids.length > 0) {
        propFilters.push(`p."propertyTypeId" = ANY($${pIdx++}::uuid[])`);
        extraParams.push(ids);
      }
    }
    const propFilterClause = propFilters.length ? ` AND ${propFilters.join(' AND ')}` : '';

    // Only return entries that have at least one active (non-deleted) property matching filters
    // Cities
    const cityRows = await this.dataSource.query(
      `SELECT c.id, c.name, c.state
       FROM master_cities c
       WHERE c.deleted_at IS NULL AND c.name ILIKE $1
         AND EXISTS (
           SELECT 1 FROM properties p
           WHERE p."cityId" = c.id AND p.is_deleted = false AND p.status = 'active'${propFilterClause}
         )
       ORDER BY (c.name ILIKE $2) DESC, c.name ASC
       LIMIT $3`,
      [like, prefixLike, perTypeLimit, ...extraParams],
    );

    // Localities with city name
    const localityRows = await this.dataSource.query(
      `SELECT l.id, l.name, l."cityId", c.name AS "cityName"
       FROM master_localities l
       LEFT JOIN master_cities c ON c.id = l."cityId" AND c.deleted_at IS NULL
       WHERE l.deleted_at IS NULL AND l.name ILIKE $1
         AND EXISTS (
           SELECT 1 FROM properties p
           WHERE p."localityId" = l.id AND p.is_deleted = false AND p.status = 'active'${propFilterClause}
         )
       ORDER BY (l.name ILIKE $2) DESC, l.name ASC
       LIMIT $3`,
      [like, prefixLike, perTypeLimit, ...extraParams],
    );

    // Societies with city (society table has localityName as string, not localityId)
    const societyRows = await this.dataSource.query(
      `SELECT s.id, s.name, s."cityId", c.name AS "cityName", s."localityName" AS "localityName"
       FROM master_societies s
       LEFT JOIN master_cities c ON c.id = s."cityId" AND c.deleted_at IS NULL
       WHERE s.deleted_at IS NULL AND s.name ILIKE $1
         AND EXISTS (
           SELECT 1 FROM properties p
           WHERE p."societyId" = s.id AND p.is_deleted = false AND p.status = 'active'${propFilterClause}
         )
       ORDER BY (s.name ILIKE $2) DESC, s.name ASC
       LIMIT $3`,
      [like, prefixLike, perTypeLimit, ...extraParams],
    );

    return {
      success: true,
      cities: cityRows.map((r: any) => ({ id: r.id, name: r.name, state: r.state ?? null })),
      localities: localityRows.map((r: any) => ({
        id: r.id, name: r.name, cityId: r.cityId, cityName: r.cityName ?? null,
      })),
      societies: societyRows.map((r: any) => ({
        id: r.id, name: r.name,
        cityId: r.cityId ?? null, cityName: r.cityName ?? null,
        localityId: null, localityName: r.localityName ?? null,
      })),
    };
  }

  /**
   * Cross-App Login: Owner/CP navigates to buyer app with their seller token.
   *
   * One-phone-one-user model: the user is the SAME person; we just hand back
   * a fresh token pair bound to their existing row so the buyer app has a
   * valid session too. We do NOT create a separate END_USER record.
   */
  async crossAppLogin(sellerAccessToken: string): Promise<{
    success: boolean;
    accessToken: string;
    refreshToken: string;
    user: { id: string; name: string; phone: string; role: string };
  }> {
    let payload: any;
    try {
      payload = this.jwtService.verify(sellerAccessToken);
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }

    if (!payload?.phone || !['OWNER', 'CHANNEL_PARTNER'].includes(payload.role)) {
      throw new BadRequestException('Token must belong to an Owner or Channel Partner');
    }

    const user = await this.userRepository.findByPhone(payload.phone);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    if (user.isBlocked) {
      throw new BadRequestException(USER_MESSAGES.USER.ACCOUNT_BLOCKED);
    }
    if (!user.isActive) {
      throw new BadRequestException(USER_MESSAGES.USER.ACCOUNT_INACTIVE);
    }

    const { accessToken, refreshToken } = this.generateTokens(user);
    await this.updateUserTokens(user.id, accessToken, refreshToken);

    return {
      success: true,
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name || '',
        phone: user.phone,
        role: user.role,
      },
    };
  }

  /**
   * Send a fresh OTP to the authenticated user's registered phone as part of the
   * Post Property handoff. The caller must verify the OTP via upgradeToOwner
   * before the role flip happens.
   */
  async sendUpgradeOtp(userId: string): Promise<SendOtpResponseDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    if (user.isBlocked) {
      throw new BadRequestException(USER_MESSAGES.USER.ACCOUNT_BLOCKED);
    }
    if (!user.isActive) {
      throw new BadRequestException(USER_MESSAGES.USER.ACCOUNT_INACTIVE);
    }
    if (user.role === UserRole.OWNER || user.role === UserRole.CHANNEL_PARTNER) {
      // Already at owner-or-above; skip the OTP and let the client move on.
      return {
        success: true,
        message: 'User is already an Owner/Channel Partner',
      };
    }
    return this.sendOtp({ phone: user.phone });
  }

  /**
   * Upgrade the caller from END_USER to OWNER after OTP verification. Same
   * row — just flips the role and issues fresh tokens so the seller app
   * picks up the new session. No-ops (with fresh tokens) if the user is
   * already OWNER or CHANNEL_PARTNER.
   */
  async upgradeToOwner(userId: string, otp?: string | null): Promise<{
    success: boolean;
    message: string;
    accessToken: string;
    refreshToken: string;
    user: { id: string; name: string | null; email: string | null; phone: string; role: string };
  }> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    if (user.isBlocked) {
      throw new BadRequestException(USER_MESSAGES.USER.ACCOUNT_BLOCKED);
    }
    if (!user.isActive) {
      throw new BadRequestException(USER_MESSAGES.USER.ACCOUNT_INACTIVE);
    }

    if (user.role === UserRole.OWNER || user.role === UserRole.CHANNEL_PARTNER) {
      // Already at owner-or-above; just mint fresh tokens so the seller app gets a clean session.
      const { accessToken, refreshToken } = this.generateTokens(user);
      await this.updateUserTokens(user.id, accessToken, refreshToken);
      return {
        success: true,
        message: 'User is already an Owner/Channel Partner',
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
      };
    }

    // Verify OTP before the role flip.
    const code = otp?.trim();
    if (!code) {
      throw new BadRequestException('OTP is required to upgrade to Owner');
    }
    const otpRecord = await this.otpRepository.findActiveByPhone(user.phone);
    if (!otpRecord) {
      throw new BadRequestException(USER_MESSAGES.OTP.NO_VALID_OTP);
    }
    if (new Date() > otpRecord.expiresAt) {
      throw new BadRequestException(USER_MESSAGES.OTP.EXPIRED);
    }
    if (otpRecord.isUsed) {
      throw new BadRequestException(USER_MESSAGES.OTP.ALREADY_USED);
    }
    if (otpRecord.attempts >= 3) {
      throw new BadRequestException(USER_MESSAGES.OTP.TOO_MANY_ATTEMPTS);
    }
    if (otpRecord.otpCode !== code) {
      await this.otpRepository.incrementAttempts(otpRecord.id);
      throw new BadRequestException(USER_MESSAGES.OTP.INVALID);
    }
    await this.otpRepository.markAsUsed(otpRecord.id);

    // END_USER or USER → promote to OWNER
    const updated = await this.userRepository.update(user.id, { role: UserRole.OWNER });
    if (!updated) {
      throw new BadRequestException('Failed to upgrade user role');
    }
    user.role = UserRole.OWNER;

    const { accessToken, refreshToken } = this.generateTokens(user);
    await this.updateUserTokens(user.id, accessToken, refreshToken);

    this.logger.log(`Upgraded user ${user.id} (${user.phone}) to OWNER`);

    return {
      success: true,
      message: 'Upgraded to Owner successfully',
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    };
  }
}
