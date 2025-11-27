import {
  Controller,
  Post,
  Body,
  Get,
  Req,
  BadRequestException,
  Query,
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
  StartDocusignDto,
  StartDocusignResponseDto,
} from './dto';
import { UpgradeToChannelPartnerDto, UpgradeToChannelPartnerResponseDto } from './dto/upgrade-channel-partner.dto';
import {
  UserLeadListQueryDto,
  UserLeadListResponseDto,
} from '../property/dto/lead-listing.dto';

@ApiTags('User Management')
@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly leadService: LeadService,
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

  @Post('channel-partner/docusign/start')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Start DocuSign embedded signing for channel partner agreement' })
  @ApiResponse({
    status: 200,
    description: 'DocuSign recipient view URL created',
    type: StartDocusignResponseDto,
  })
  async startChannelPartnerDocusign(
    @Body() dto: StartDocusignDto,
    @Req() req: Request,
  ): Promise<StartDocusignResponseDto> {
    if (!req.user?.id) {
      throw new BadRequestException('User not authenticated');
    }
    return await this.userService.startChannelPartnerDocusign(dto, req.user.id);
  }

  @Post('channel-partner/docusign/webhook')
  @ApiOperation({ summary: 'DocuSign Connect webhook (envelope status updates)' })
  @ApiResponse({ status: 200, description: 'Acknowledged' })
  async docusignWebhook(@Body() body: any): Promise<{ ok: boolean }> {
    // Accept both JSON and Connect payloads; we expect envelopeId and status
    try {
      const envelopeId =
        body?.envelopeId ||
        body?.envelopeSummary?.envelopeId ||
        body?.envelope?.envelopeId ||
        body?.data?.envelopeId;
      const status =
        body?.status ||
        body?.envelopeStatus ||
        body?.envelopeSummary?.status ||
        body?.envelope?.status ||
        body?.data?.status;
      if (envelopeId && status) {
        // Shallow import here to avoid circular: call service method through userService (exposing repository via service is not ideal; kept simple)
        const repo: any = (this.userService as any)['agreementRepository'];
        if (repo && repo.updateByEnvelope) {
          await repo.updateByEnvelope(envelopeId, {
            status,
            completedAt: status === 'completed' ? new Date() : null,
          });
        }
      }
    } catch {
      // swallow and still ack; DocuSign expects 200
    }
    return { ok: true };
  }

  @Get('channel-partner/docusign/status')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get latest DocuSign agreement status for current user' })
  @ApiResponse({ status: 200, description: 'Agreement status', schema: {
    example: { status: 'completed', envelopeId: '...', completedAt: '2025-01-01T10:00:00.000Z' },
  }})
  async getDocusignStatus(@Req() req: Request) {
    if (!req.user?.id) {
      throw new BadRequestException('User not authenticated');
    }
    const repo: any = (this.userService as any)['agreementRepository'];
    const latest = repo ? await repo.findLatestByUser(req.user.id) : null;
    return latest
      ? {
          envelopeId: latest.envelopeId,
          status: latest.status,
          completedAt: latest.completedAt,
        }
      : { status: 'not_started' };
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
}
