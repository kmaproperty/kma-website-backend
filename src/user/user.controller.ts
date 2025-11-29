import {
  Controller,
  Post,
  Body,
  Get,
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
} from '@nestjs/swagger';
import { Request } from 'express';
import { UserService } from './user.service';
import { LeadService } from '../admin/services/lead.service';
import { DocuSignService } from './services/docusign.service';
import { ChannelPartnerAgreementRepository } from './repositories/channel-partner-agreement.repository';
import { ApiResponseDto, ApiResponse as ApiResponseType } from '../common/dto';
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
  DashboardResponseDto,
  CreateEnvelopeDto,
  CreateEnvelopeResponseDto,
  GetAgreementResponseDto,
  ListAgreementsResponseDto,
  CreateFixedAgreementEnvelopeDto,
  UpdateEnvelopeStatusDto,
  UpdateEnvelopeStatusResponseDto,
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
  @ApiOperation({ summary: 'Send OTP for signup (phone must be new)' })
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
  @ApiOperation({ summary: 'Send OTP for login (phone must exist)' })
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

  @Get('/profile')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({
    status: 200,
    description: 'User details',
  })
  async getUserProfile(@Req() req: Request) {
    if (!req.user?.id) {
      throw new BadRequestException('User not authenticated');
    }
    const user = await this.userService.getUserById(req.user.id);
    if (!user) {
      throw new BadRequestException('User not found');
    }
    return user;
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

  @Post('docusign/create-envelope')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Create DocuSign envelope for channel partner agreement' })
  @ApiResponse({
    status: 201,
    description: 'Envelope created successfully',
    type: CreateEnvelopeResponseDto,
  })
  async createEnvelope(
    @Body() createEnvelopeDto: CreateEnvelopeDto,
    @Req() req: Request,
  ): Promise<CreateEnvelopeResponseDto> {
    if (!req.user?.id) {
      throw new BadRequestException('User not authenticated');
    }

    const returnUrl = createEnvelopeDto.returnUrl || `${process.env.FRONTEND_URL || 'http://localhost:3000'}/signature-complete`;
    
    const { envelopeId, url } = await this.docuSignService.createEnvelope(
      req.user.id,
      createEnvelopeDto.recipientEmail,
      createEnvelopeDto.recipientName,
      createEnvelopeDto.documentBase64,
      createEnvelopeDto.documentName,
      returnUrl,
    );

    return {
      success: true,
      message: 'Envelope created successfully',
      envelopeId,
      url,
    };
  }

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
      );

    return {
      success: true,
      message: 'Channel Partner Agreement envelope created successfully',
      envelopeId,
      url,
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

  @Get('docusign/agreements/:envelopeId')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get agreement by envelope ID' })
  @ApiResponse({
    status: 200,
    description: 'Agreement retrieved successfully',
    type: GetAgreementResponseDto,
  })
  async getAgreement(
    @Param('envelopeId') envelopeId: string,
    @Req() req: Request,
  ): Promise<GetAgreementResponseDto> {
    if (!req.user?.id) {
      throw new BadRequestException('User not authenticated');
    }

    const agreement = await this.agreementRepository.findByEnvelopeId(envelopeId);
    
    if (!agreement) {
      throw new BadRequestException('Agreement not found');
    }

    if (agreement.userId !== req.user.id) {
      throw new BadRequestException('Unauthorized to access this agreement');
    }

    return {
      success: true,
      message: 'Agreement retrieved successfully',
      data: {
        id: agreement.id,
        userId: agreement.userId,
        envelopeId: agreement.envelopeId,
        status: agreement.status,
        completedAt: agreement.completedAt,
        returnUrl: agreement.returnUrl,
        createdAt: agreement.createdAt,
        updatedAt: agreement.updatedAt,
      },
    };
  }

  @Post('docusign/update-status')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Update envelope status from DocuSign' })
  @ApiResponse({
    status: 200,
    description: 'Envelope status updated successfully',
    type: UpdateEnvelopeStatusResponseDto,
  })
  async updateEnvelopeStatus(
    @Body() updateStatusDto: UpdateEnvelopeStatusDto,
    @Req() req: Request,
  ): Promise<UpdateEnvelopeStatusResponseDto> {
    if (!req.user?.id) {
      throw new BadRequestException('User not authenticated');
    }

    const agreement = await this.agreementRepository.findByEnvelopeId(
      updateStatusDto.envelopeId,
    );

    if (!agreement) {
      throw new BadRequestException('Agreement not found');
    }

    if (agreement.userId !== req.user.id) {
      throw new BadRequestException('Unauthorized to update this agreement');
    }

    const updatedAgreement = await this.docuSignService.updateAgreementStatus(
      updateStatusDto.envelopeId,
    );

    if (!updatedAgreement) {
      throw new BadRequestException('Failed to update agreement status');
    }

    return {
      success: true,
      message: 'Envelope status updated successfully',
      data: {
        id: updatedAgreement.id,
        userId: updatedAgreement.userId,
        envelopeId: updatedAgreement.envelopeId,
        status: updatedAgreement.status,
        completedAt: updatedAgreement.completedAt,
        returnUrl: updatedAgreement.returnUrl,
        createdAt: updatedAgreement.createdAt,
        updatedAt: updatedAgreement.updatedAt,
      },
    };
  }

  @Post('docusign/webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'DocuSign webhook endpoint for envelope status updates' })
  @ApiResponse({
    status: 200,
    description: 'Webhook processed successfully',
  })
  async handleDocuSignWebhook(@Body() webhookData: any): Promise<{ success: boolean }> {
    try {
      // DocuSign webhook format varies, but typically includes envelope data
      const envelopeId = webhookData?.data?.envelopeId || webhookData?.envelopeId;
      const status = webhookData?.data?.status || webhookData?.status;

      if (!envelopeId) {
        this.logger.warn('Webhook received without envelope ID');
        return { success: false };
      }

      await this.docuSignService.handleWebhook(envelopeId, status);
      return { success: true };
    } catch (error) {
      this.logger.error('Error handling DocuSign webhook', error);
      return { success: false };
    }
  }
}
