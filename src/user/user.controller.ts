import {
  Controller,
  Post,
  Body,
  Get,
  Put,
  Req,
  BadRequestException,
  Query,
  Param,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiOkResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { Request } from 'express';
import { UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { LeadService } from '../admin/services/lead.service';
import { DocuSignService } from './services/docusign.service';
import { ChannelPartnerAgreementRepository } from './repositories/channel-partner-agreement.repository';
import { ApiResponseDto, ApiResponse as ApiResponseType } from '../common/dto';
import { Public } from '../common/decorators/public.decorator';
import { AgreementStatus } from './entities/channel-partner-agreement.entity';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
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
  DashboardResponseDto,
  CreateEnvelopeDto,
  CreateEnvelopeResponseDto,
  ListAgreementsResponseDto,
  CreateFixedAgreementEnvelopeDto,
  UpdateEnvelopeStatusDto,
  UpdateEnvelopeStatusResponseDto,
  CreateTemplateDto,
  CreateTemplateResponseDto,
  ListAgreementsSimplifiedResponseDto,
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
  EmailDto,
  CheckDuplicateEmailResponseDto,
  OwnerProfileResponseDto,
  OwnerEditProfileDto,
  OwnerEditProfileResponseDto,
  ChannelPartnerProfileResponseDto,
  ChannelPartnerEditProfileDto,
  ChannelPartnerEditProfileResponseDto,
  UserProfileResponseDto,
  UserEditProfileDto,
  UserEditProfileResponseDto,
} from './dto';
import { UpgradeToChannelPartnerDto, UpgradeToChannelPartnerResponseDto } from './dto/upgrade-channel-partner.dto';
import {
  UserLeadListQueryDto,
  UserLeadListResponseDto,
} from '../property/dto/lead-listing.dto';

@ApiTags('User Management')
@Controller('users')
export class UserController {
  private readonly logger = new Logger(UserController.name);

  constructor(
    private readonly userService: UserService,
    private readonly leadService: LeadService,
    private readonly docuSignService: DocuSignService,
    private readonly agreementRepository: ChannelPartnerAgreementRepository,
  ) {}

  @Post('signup/send-otp')
  @ApiOperation({ 
    summary: 'Send OTP for signup (phone must be new)',
    description: 'Supports OWNER, CHANNEL_PARTNER, and END_USER roles. Use validate-otp with role parameter to specify user type.'
  })
  @ApiResponse({
    status: 200,
    description: 'OTP sent successfully',
    type: SendOtpResponseDto,
  })
  async signupSendOtp(
    @Body() sendOtpDto: SendOtpDto,
  ): Promise<SendOtpResponseDto> {
    return await this.userService.sendOtpForSignup(sendOtpDto);
  }

  @Post('upgrade-channel-partner')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Upgrade OWNER to CHANNEL_PARTNER with valid code' })
  @ApiResponse({
    status: 200,
    description: 'Upgraded successfully',
    type: UpgradeToChannelPartnerResponseDto,
  })
  async upgradeToChannelPartner(
    @Body() dto: UpgradeToChannelPartnerDto,
    @Req() req: Request,
  ): Promise<UpgradeToChannelPartnerResponseDto> {
    if (!req.user?.id) {
      throw new BadRequestException('User not authenticated');
    }
    return await this.userService.upgradeToChannelPartner(dto, req.user.id);
  }

  @Post('login/send-otp')
  @ApiOperation({ 
    summary: 'Send OTP for login (phone must exist)',
    description: 'For OWNER and CHANNEL_PARTNER: role should not be passed. API will automatically check if the phone exists for either OWNER or CHANNEL_PARTNER. For END_USER: role is required.'
  })
  @ApiResponse({
    status: 200,
    description: 'OTP sent successfully',
    type: SendOtpResponseDto,
  })
  async loginSendOtp(
    @Body() sendOtpDto: SendOtpDto,
  ): Promise<SendOtpResponseDto> {
    return await this.userService.sendOtpForLogin(sendOtpDto);
  }

  @Post('validate-otp')
  @ApiOperation({
    summary: 'Validate OTP and check if user needs additional details',
    description: 'For OWNER and CHANNEL_PARTNER: role should not be passed. API will automatically check if the phone exists for either OWNER or CHANNEL_PARTNER. For END_USER: role is required. Send X-Session-Id header to merge anonymous session data after login.',
  })
  @ApiResponse({
    status: 200,
    description: 'OTP validation result',
    type: ValidateOtpResponseDto,
  })
  async validateOtp(
    @Body() validateOtpDto: ValidateOtpDto,
    @Req() req: Request,
  ): Promise<ValidateOtpResponseDto> {
    const sessionId = (req.headers['x-session-id'] as string)?.trim() || null;
    return await this.userService.validateOtp(validateOtpDto, sessionId);
  }

  @Post('upgrade/send-otp')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Send OTP to the authenticated user for the END_USER → OWNER upgrade flow',
    description:
      'Sends a fresh 4-digit OTP to the registered phone of the caller. The OTP must then be verified via POST /users/upgrade-to-owner. No-ops for callers that are already OWNER/CHANNEL_PARTNER.',
  })
  @ApiResponse({ status: 200, description: 'OTP sent (or no-op for Owner/CP)' })
  async sendUpgradeOtp(@Req() req: Request): Promise<SendOtpResponseDto> {
    const userId = (req.user as { id?: string } | undefined)?.id;
    if (!userId) {
      throw new BadRequestException('Authenticated user required');
    }
    return await this.userService.sendUpgradeOtp(userId);
  }

  @Post('upgrade-to-owner')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Upgrade the current user from END_USER to OWNER (OTP-verified)',
    description:
      'Used when an end-user on the buyer site clicks "Post Property" and is handed off to the seller domain. Requires the OTP sent via POST /users/upgrade/send-otp. Flips the user\'s role on the same row and returns fresh tokens so the seller app can pick up the new session. No-ops (with fresh tokens) if the user is already OWNER/CHANNEL_PARTNER.',
  })
  @ApiResponse({ status: 200, description: 'Role upgraded (or no-op if already Owner/CP)' })
  async upgradeToOwner(
    @Req() req: Request,
    @Body() body: { otp?: string } = {},
  ): Promise<{
    success: boolean;
    message: string;
    accessToken: string;
    refreshToken: string;
    user: { id: string; name: string | null; email: string | null; phone: string; role: string };
  }> {
    const userId = (req.user as { id?: string } | undefined)?.id;
    if (!userId) {
      throw new BadRequestException('Authenticated user required');
    }
    return await this.userService.upgradeToOwner(userId, body.otp ?? null);
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
    if (!req.tokenData) {
      throw new BadRequestException('Token data not found');
    }
    return await this.userService.createOwner(createOwnerDto, req.tokenData);
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
    if (!req.tokenData) {
      throw new BadRequestException('Token data not found');
    }
    return await this.userService.createChannelPartner(
      createChannelPartnerDto,
      req.tokenData,
    );
  }

  @Post('create-end-user')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Create END_USER account (optional - add name and email)' })
  @ApiResponse({
    status: 201,
    description: 'End user account created successfully',
  })
  async createEndUser(
    @Body() createEndUserDto: CreateEndUserDto,
    @Req() req: Request,
  ): Promise<CreateEndUserResponseDto> {
    if (!req.tokenData) {
      throw new BadRequestException('Token data not found');
    }
    return await this.userService.createEndUser(createEndUserDto, req.tokenData);
  }

  @Get('/profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get user profile (Owner or Channel Partner)' })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
    type: UserProfileResponseDto,
  })
  async getUserProfile(
    @Req() req: Request,
  ): Promise<UserProfileResponseDto> {
    if (!req.user?.id) {
      throw new BadRequestException('User not authenticated');
    }
    return await this.userService.getUserProfile(req.user.id);
  }

  @Put('/profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Edit user profile (Owner or Channel Partner)' })
  @ApiResponse({
    status: 200,
    description: 'User profile updated successfully',
    type: UserEditProfileResponseDto,
  })
  async editUserProfile(
    @Body() editProfileDto: UserEditProfileDto,
    @Req() req: Request,
  ): Promise<UserEditProfileResponseDto> {
    if (!req.user?.id) {
      throw new BadRequestException('User not authenticated');
    }
    return await this.userService.editUserProfile(
      req.user.id,
      editProfileDto,
    );
  }

  @Post('/profile-pic')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Upload profile picture' })
  @ApiResponse({
    status: 200,
    description: 'Profile picture uploaded successfully',
    type: UploadProfilePicResponseDto,
  })
  async uploadProfilePic(
    @Body() uploadProfilePicDto: UploadProfilePicDto,
    @Req() req: Request,
  ): Promise<UploadProfilePicResponseDto> {
    if (!req.user?.id) {
      throw new BadRequestException('User not authenticated');
    }
    return await this.userService.uploadProfilePic(
      req.user.id,
      uploadProfilePicDto,
    );
  }

  @Get('/profile-pic')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get profile picture' })
  @ApiResponse({
    status: 200,
    description: 'Profile picture retrieved successfully',
    type: GetProfilePicResponseDto,
  })
  async getProfilePic(
    @Req() req: Request,
  ): Promise<GetProfilePicResponseDto> {
    if (!req.user?.id) {
      throw new BadRequestException('User not authenticated');
    }
    return await this.userService.getProfilePic(req.user.id);
  }

  // Step 1: Live Photo Upload
  @Post('/verification/live-photo')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Upload live photo (Step 1)' })
  @ApiResponse({
    status: 200,
    description: 'Live photo uploaded successfully',
    type: UploadLivePhotoResponseDto,
  })
  async uploadLivePhoto(
    @Body() uploadLivePhotoDto: UploadLivePhotoDto,
    @Req() req: Request,
  ): Promise<UploadLivePhotoResponseDto> {
    if (!req.user?.id) {
      throw new BadRequestException('User not authenticated');
    }
    return await this.userService.uploadLivePhoto(
      req.user.id,
      uploadLivePhotoDto,
    );
  }

  // Step 2: Aadhaar Verification
  @Post('/verification/aadhaar')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Verify Aadhaar (Step 2)' })
  @ApiResponse({
    status: 200,
    description: 'Aadhaar details saved successfully',
    type: VerifyAadhaarResponseDto,
  })
  async verifyAadhaar(
    @Body() verifyAadhaarDto: VerifyAadhaarDto,
    @Req() req: Request,
  ): Promise<VerifyAadhaarResponseDto> {
    if (!req.user?.id) {
      throw new BadRequestException('User not authenticated');
    }
    return await this.userService.verifyAadhaar(
      req.user.id,
      verifyAadhaarDto,
    );
  }

  // Step 3: Bank Details
  @Post('/verification/bank-details')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Save bank details (Step 3)' })
  @ApiResponse({
    status: 200,
    description: 'Bank details saved successfully',
    type: BankDetailsResponseDto,
  })
  async saveBankDetails(
    @Body() bankDetailsDto: BankDetailsDto,
    @Req() req: Request,
  ): Promise<BankDetailsResponseDto> {
    if (!req.user?.id) {
      throw new BadRequestException('User not authenticated');
    }
    return await this.userService.saveBankDetails(
      req.user.id,
      bankDetailsDto,
    );
  }

  // Step 4: DocuSign Agreement Status
  @Get('/verification/docusign-agreement')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get DocuSign agreement status (Step 4)' })
  @ApiResponse({
    status: 200,
    description: 'DocuSign agreement status retrieved successfully',
    type: DocuSignAgreementStatusResponseDto,
  })
  async getDocuSignAgreementStatus(
    @Req() req: Request,
  ): Promise<DocuSignAgreementStatusResponseDto> {
    if (!req.user?.id) {
      throw new BadRequestException('User not authenticated');
    }
    return await this.userService.getDocuSignAgreementStatus(req.user.id);
  }

  // Get all verification steps status
  @Get('/verification/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get all verification steps status' })
  @ApiResponse({
    status: 200,
    description: 'Verification steps status retrieved successfully',
    type: VerificationStepsStatusResponseDto,
  })
  async getVerificationStepsStatus(
    @Req() req: Request,
  ): Promise<VerificationStepsStatusResponseDto> {
    if (!req.user?.id) {
      throw new BadRequestException('User not authenticated');
    }
    return await this.userService.getVerificationStepsStatus(req.user.id);
  }

  // Get live photo with status
  @Get('/verification/live-photo')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get live photo with approval status' })
  @ApiResponse({
    status: 200,
    description: 'Live photo details retrieved successfully',
    type: GetLivePhotoResponseDto,
  })
  async getLivePhoto(
    @Req() req: Request,
  ): Promise<GetLivePhotoResponseDto> {
    if (!req.user?.id) {
      throw new BadRequestException('User not authenticated');
    }
    return await this.userService.getLivePhoto(req.user.id);
  }

  // Get Aadhaar details with status
  @Get('/verification/aadhaar')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get Aadhaar details with verification status' })
  @ApiResponse({
    status: 200,
    description: 'Aadhaar details retrieved successfully',
    type: GetAadhaarDetailsResponseDto,
  })
  async getAadhaarDetails(
    @Req() req: Request,
  ): Promise<GetAadhaarDetailsResponseDto> {
    if (!req.user?.id) {
      throw new BadRequestException('User not authenticated');
    }
    return await this.userService.getAadhaarDetails(req.user.id);
  }

  // Get bank details
  @Get('/verification/bank-details')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get bank details (decrypted)' })
  @ApiResponse({
    status: 200,
    description: 'Bank details retrieved successfully',
    type: GetBankDetailsResponseDto,
  })
  async getBankDetails(
    @Req() req: Request,
  ): Promise<GetBankDetailsResponseDto> {
    if (!req.user?.id) {
      throw new BadRequestException('User not authenticated');
    }
    return await this.userService.getUserBankDetails(req.user.id);
  }

  @Get('dashboard')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get seller/channel partner dashboard data' })
  @ApiResponse({
    status: 200,
    description: 'Dashboard data',
    type: DashboardResponseDto,
  })
  async getDashboard(@Req() req: Request): Promise<DashboardResponseDto> {
    if (!req.user?.id) {
      throw new BadRequestException('User not authenticated');
    }
    return await this.userService.getDashboard(req.user.id);
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
    if (!req.user?.id) {
      throw new BadRequestException('User not authenticated');
    }
    return await this.userService.logout(req.user.id);
  }

  @Get('cities')
  @ApiOperation({ summary: 'Get list of supported cities' })
  @ApiOkResponse({ description: 'Cities list' })
  getCities(): ApiResponseType<string[]> {
    const cities = this.userService.getCities();
    return ApiResponseDto.success(cities, 'Cities fetched successfully');
  }

  @Get('auto-detect-city')
  @Public()
  @ApiOperation({
    summary: 'Auto-detect nearby cities',
    description:
      'Detects nearby cities (within 10-15 km) based on latitude and longitude using Google Places API. Returns up to 15 cities sorted by proximity.',
  })
  @ApiQuery({
    name: 'latitude',
    required: true,
    description: 'Latitude coordinate',
    example: 28.6139,
    type: Number,
  })
  @ApiQuery({
    name: 'longitude',
    required: true,
    description: 'Longitude coordinate',
    example: 77.2090,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Nearby cities detected successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid latitude or longitude',
  })
  async autoDetectCity(
    @Query('latitude') latitude: number,
    @Query('longitude') longitude: number,
  ): Promise<ApiResponseType<any[]>> {
    if (
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      throw new BadRequestException('Invalid latitude or longitude values');
    }
    const cities = await this.userService.autoDetectCity(latitude, longitude);
    return ApiResponseDto.success(cities, 'Cities detected successfully');
  }

  @Post('check-duplicate-email')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Check if email already exists',
    description: 'Checks if the provided email address is already registered in the system. Returns 200 if available, 400 if duplicate.',
  })
  @ApiResponse({
    status: 200,
    description: 'Email is available',
    type: CheckDuplicateEmailResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Email already exists or invalid email format',
  })
  async checkDuplicateEmail(
    @Body() emailDto: EmailDto,
  ): Promise<ApiResponseType<CheckDuplicateEmailResponseDto>> {
    const result = await this.userService.checkDuplicateEmail(emailDto.email);
    return ApiResponseDto.success(result, result.message);
  }

  @Get('leads')
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'List leads for user properties',
    description:
      'Retrieves leads that have contacted properties posted by the authenticated user (owner/channel partner). Users can only see leads for their own properties.',
  })
  @ApiResponse({
    status: 200,
    description: 'Leads retrieved successfully',
    type: UserLeadListResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'User not authenticated',
  })
  async listLeads(
    @Query() query: UserLeadListQueryDto,
    @Req() req: Request,
  ): Promise<UserLeadListResponseDto> {
    if (!req.user?.id) {
      throw new BadRequestException('User not authenticated');
    }
    return await this.leadService.listLeadsForUser(req.user.id, query);
  }

  // @Post('docusign/create-envelope')
  // @ApiBearerAuth('access-token')
  // @ApiOperation({ summary: 'Create DocuSign envelope for channel partner agreement' })
  // @ApiResponse({
  //   status: 201,
  //   description: 'Envelope created successfully',
  //   type: CreateEnvelopeResponseDto,
  // })
  // async createEnvelope(
  //   @Body() createEnvelopeDto: CreateEnvelopeDto,
  //   @Req() req: Request,
  // ): Promise<CreateEnvelopeResponseDto> {
  //   if (!req.user?.id) {
  //     throw new BadRequestException('User not authenticated');
  //   }

  //   const returnUrl = createEnvelopeDto.returnUrl || `${process.env.FRONTEND_URL || 'http://localhost:3000'}/signature-complete`;
    
  //   const { envelopeId, url } = await this.docuSignService.createEnvelope(
  //     req.user.id,
  //     createEnvelopeDto.recipientEmail,
  //     createEnvelopeDto.recipientName,
  //     createEnvelopeDto.documentBase64,
  //     createEnvelopeDto.documentName,
  //     returnUrl,
  //   );

  //   return {
  //     success: true,
  //     message: 'Envelope created successfully',
  //     envelopeId,
  //     url,
  //   };
  // }

  @Post('docusign/channel-partner-agreement')
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary:
      'Create DocuSign envelope for the fixed Channel Partner Agreement document',
  })
  @ApiResponse({
    status: 201,
    description: 'Channel Partner Agreement envelope created successfully',
    type: CreateEnvelopeResponseDto,
  })
  async createChannelPartnerAgreementEnvelope(
    @Body() body: CreateFixedAgreementEnvelopeDto,
    @Req() req: Request,
  ): Promise<CreateEnvelopeResponseDto> {
    if (!req.user?.id) {
      throw new BadRequestException('User not authenticated');
    }

    const user = await this.userService.getUserById(req.user.id);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (!user.email || !user.name) {
      throw new BadRequestException(
        'User must have name and email set before signing the agreement',
      );
    }

    const returnUrl =
      body.returnUrl ||
      `${process.env.FRONTEND_URL || 'http://localhost:3000'}/signature-complete`;

    const { envelopeId, url } =
      await this.docuSignService.createChannelPartnerAgreementEnvelope(
        user.id,
        user.email,
        user.name,
        returnUrl,
        {
          phone: user.phone,
          city: (user as any).cities || '',
          firmName: (user as any).firmName || '',
        },
      );

    return {
      success: true,
      message: 'Channel Partner Agreement envelope created successfully',
      envelopeId,
      url,
    };
  }

  @Post('docusign/create-template')
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary:
      'Create a DocuSign template from the Channel Partner Agreement PDF (one-time setup)',
    description:
      'This endpoint creates a template in DocuSign from the PDF configured in DOCUSIGN_CHANNEL_PARTNER_AGREEMENT_PATH. ' +
      'After creating the template, save the returned template ID to the DOCUSIGN_TEMPLATE_ID environment variable. ' +
      'Once configured, all future envelope creations will use this template instead of uploading the PDF each time.',
  })
  @ApiResponse({
    status: 201,
    description: 'Template created successfully',
    type: CreateTemplateResponseDto,
  })
  async createTemplate(
    @Body() body: CreateTemplateDto,
    @Req() req: Request,
  ): Promise<CreateTemplateResponseDto> {
    if (!req.user?.id) {
      throw new BadRequestException('User not authenticated');
    }

    const templateName =
      body.templateName || 'Channel Partner Agreement Template';

    const { templateId } = await this.docuSignService.createTemplate(
      templateName,
    );

    return {
      success: true,
      message: 'Template created successfully',
      templateId,
      instructions:
        'Save this template ID to DOCUSIGN_TEMPLATE_ID environment variable. ' +
        'Once configured, all future envelope creations will automatically use this template.',
    };
  }

  @Get('agreements')
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'List all agreements for the authenticated user',
    description: 'Returns a list of all agreements with their status (sent, pending, or completed) for the authenticated user'
  })
  @ApiResponse({
    status: 200,
    description: 'Agreements retrieved successfully',
    type: ListAgreementsSimplifiedResponseDto,
  })
  async listAgreements(@Req() req: Request): Promise<ListAgreementsSimplifiedResponseDto> {
    if (!req.user?.id) {
      throw new BadRequestException('User not authenticated');
    }

    const agreements = await this.agreementRepository.findByUserId(req.user.id);
    
    // Helper function to map AgreementStatus to simplified status
    const getSimplifiedStatus = (status: AgreementStatus): 'sent' | 'pending' | 'completed' => {
      if (status === AgreementStatus.COMPLETED) {
        return 'completed';
      } else if (status === AgreementStatus.SENT) {
        return 'sent';
      } else {
        // DELIVERED, SIGNED, DECLINED, VOIDED -> pending
        return 'pending';
      }
    };

    return {
      success: true,
      message: 'Agreements retrieved successfully',
      data: agreements.map((agreement) => ({
        id: agreement.id,
        userId: agreement.userId,
        envelopeId: agreement.envelopeId,
        status: getSimplifiedStatus(agreement.status),
        completedAt: agreement.completedAt,
        returnUrl: agreement.returnUrl,
        createdAt: agreement.createdAt,
        updatedAt: agreement.updatedAt,
      })),
    };
  }

  @Get('docusign/agreements')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get all agreements for the authenticated user' })
  @ApiResponse({
    status: 200,
    description: 'Agreements retrieved successfully',
    type: ListAgreementsResponseDto,
  })
  async getAgreements(@Req() req: Request): Promise<ListAgreementsResponseDto> {
    if (!req.user?.id) {
      throw new BadRequestException('User not authenticated');
    }

    const agreements = await this.agreementRepository.findByUserId(req.user.id);
    
    return {
      success: true,
      message: 'Agreements retrieved successfully',
      data: agreements.map((agreement) => ({
        id: agreement.id,
        userId: agreement.userId,
        envelopeId: agreement.envelopeId,
        status: agreement.status,
        completedAt: agreement.completedAt,
        returnUrl: agreement.returnUrl,
        createdAt: agreement.createdAt,
        updatedAt: agreement.updatedAt,
      })),
    };
  }

  // @Post('docusign/update-status')
  // @ApiBearerAuth('access-token')
  // @ApiOperation({ summary: 'Update envelope status from DocuSign' })
  // @ApiResponse({
  //   status: 200,
  //   description: 'Envelope status updated successfully',
  //   type: UpdateEnvelopeStatusResponseDto,
  // })
  // async updateEnvelopeStatus(
  //   @Body() updateStatusDto: UpdateEnvelopeStatusDto,
  //   @Req() req: Request,
  // ): Promise<UpdateEnvelopeStatusResponseDto> {
  //   if (!req.user?.id) {
  //     throw new BadRequestException('User not authenticated');
  //   }

  //   const agreement = await this.agreementRepository.findByEnvelopeId(
  //     updateStatusDto.envelopeId,
  //   );

  //   if (!agreement) {
  //     throw new BadRequestException('Agreement not found');
  //   }

  //   if (agreement.userId !== req.user.id) {
  //     throw new BadRequestException('Unauthorized to update this agreement');
  //   }

  //   const updatedAgreement = await this.docuSignService.updateAgreementStatus(
  //     updateStatusDto.envelopeId,
  //   );

  //   if (!updatedAgreement) {
  //     throw new BadRequestException('Failed to update agreement status');
  //   }

  //   return {
  //     success: true,
  //     message: 'Envelope status updated successfully',
  //     data: {
  //       id: updatedAgreement.id,
  //       userId: updatedAgreement.userId,
  //       envelopeId: updatedAgreement.envelopeId,
  //       status: updatedAgreement.status,
  //       completedAt: updatedAgreement.completedAt,
  //       returnUrl: updatedAgreement.returnUrl,
  //       createdAt: updatedAgreement.createdAt,
  //       updatedAt: updatedAgreement.updatedAt,
  //     },
  //   };
  // }

  @Post('docusign/sync-status')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Sync agreement status from DocuSign after signing' })
  async syncDocuSignStatus(@Req() req: Request) {
    if (!req.user?.id) {
      throw new BadRequestException('User not authenticated');
    }
    const agreement = await this.agreementRepository.findLatestByUserId(req.user.id);
    if (!agreement) {
      throw new BadRequestException('No agreement found');
    }
    const updated = await this.docuSignService.updateAgreementStatus(agreement.envelopeId);
    return {
      success: true,
      status: updated?.status || 'unknown',
      completedAt: updated?.completedAt || null,
    };
  }

  @Post('docusign/webhook')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'DocuSign webhook endpoint for envelope status updates' })
  @ApiResponse({
    status: 200,
    description: 'Webhook processed successfully',
  })
  async handleDocuSignWebhook(
    @Body() webhookData: any,
    @Req() req: Request,
  ): Promise<{ success: boolean }> {
    // CRITICAL: Return response immediately with minimal processing
    // DocuSign requires a response within ~5 seconds or it closes the connection
    // Store request metadata for async processing
    const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
    const userAgent = req.get('user-agent') || 'unknown';
    const contentType = req.get('content-type');
    
    // Quick extraction of envelope ID (minimal processing)
    let envelopeId: string | null = null;
    let eventType: string | null = null;
    
    try {
      // Handle the actual DocuSign Connect format:
      // { event: 'recipient-completed', data: { envelopeId: '...' }, ... }
      if (webhookData?.data?.envelopeId) {
        envelopeId = webhookData.data.envelopeId;
        eventType = webhookData.event;
      } else if (webhookData?.envelopeId) {
        envelopeId = webhookData.envelopeId;
        eventType = webhookData.event;
      } else if (Array.isArray(webhookData) && webhookData.length > 0) {
        const firstEvent = webhookData[0];
        envelopeId = firstEvent?.data?.envelopeId || firstEvent?.envelopeId;
        eventType = firstEvent?.event;
      }
    } catch (parseError) {
      // Silently catch parse errors - we'll log them async
    }

    // Return success immediately - process everything else asynchronously
    const response = { success: true };

    // Process everything asynchronously AFTER response is sent
    // Use process.nextTick to ensure response is sent first
    process.nextTick(async () => {
      const startTime = Date.now();
      const payloadStr = JSON.stringify(webhookData);
      
      try {
        this.logger.log('DocuSign webhook received (async processing)', {
          clientIp,
          userAgent,
          contentType,
          payloadKeys: Object.keys(webhookData || {}),
          payloadPreview: payloadStr.substring(0, 1000),
          payloadSize: payloadStr.length,
        });

        // Re-parse with full logging
        let finalEnvelopeId: string | null = null;
        let finalEventType: string | null = null;
        let finalStatus: string | null = null;

        if (Array.isArray(webhookData)) {
          this.logger.log('Webhook payload is an array', { eventCount: webhookData.length });
          if (webhookData.length > 0) {
            const firstEvent = webhookData[0];
            finalEnvelopeId = firstEvent?.envelopeId || firstEvent?.data?.envelopeId;
            finalEventType = firstEvent?.event;
            finalStatus = firstEvent?.data?.status || firstEvent?.status;
          }
        } else if (webhookData) {
          // Handle single event object - actual DocuSign format
          finalEnvelopeId = webhookData.envelopeId || webhookData?.data?.envelopeId;
          finalEventType = webhookData.event;
          finalStatus = webhookData?.data?.status || webhookData.status;
        }

        this.logger.debug('Extracted webhook data', {
          envelopeId: finalEnvelopeId,
          eventType: finalEventType,
          status: finalStatus,
          isArray: Array.isArray(webhookData),
          structure: {
            hasEnvelopeId: !!webhookData?.envelopeId,
            hasData: !!webhookData?.data,
            hasEvent: !!webhookData?.event,
            topLevelKeys: Object.keys(webhookData || {}),
          },
        });

        if (!finalEnvelopeId) {
          this.logger.warn('Webhook received without envelope ID', {
            clientIp,
            payloadStructure: {
              isArray: Array.isArray(webhookData),
              hasData: !!webhookData?.data,
              hasEnvelopeId: !!webhookData?.envelopeId,
              hasEvent: !!webhookData?.event,
              topLevelKeys: Object.keys(webhookData || {}),
            },
            fullPayload: payloadStr.substring(0, 2000),
          });
          return;
        }

        this.logger.log('Processing webhook asynchronously', {
          envelopeId: finalEnvelopeId,
          eventType: finalEventType,
          status: finalStatus,
        });

        const processStartTime = Date.now();
        const result = await this.docuSignService.handleWebhook(
          finalEnvelopeId,
          finalStatus || finalEventType || 'unknown',
        );

        const processDuration = Date.now() - processStartTime;
        this.logger.log('Webhook processed successfully (async)', {
          envelopeId: finalEnvelopeId,
          eventType: finalEventType,
          status: finalStatus,
          processDurationMs: processDuration,
          totalDurationMs: Date.now() - startTime,
          agreementUpdated: !!result,
          agreementId: result?.id,
        });
    } catch (error) {
        const duration = Date.now() - startTime;
        this.logger.error('Error processing webhook asynchronously', {
          error: error.message,
          stack: error.stack,
          envelopeId,
          eventType,
          clientIp,
          durationMs: duration,
          payloadPreview: payloadStr.substring(0, 1000),
        });
      }
    });

    // Return immediately - this is critical for DocuSign
    return response;
  }
}
