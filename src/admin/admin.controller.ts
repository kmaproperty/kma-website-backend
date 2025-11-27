import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiQuery,
} from '@nestjs/swagger';
import { Request } from 'express';
import { AdminService } from './admin.service';
import { LeadService } from './services/lead.service';
import {
  AdminLoginDto,
  AdminLoginResponseDto,
  AdminPropertyListQueryDto,
  AdminPropertyListResponseDto,
  AdminRejectPropertyDto,
  AdminReviewPropertyDto,
  AdminUpdatePropertyDto,
  AdminCityListQueryDto,
  AdminCityResponseDto,
  AdminCreateCityDto,
  AdminUpdateCityDto,
  AdminSocietyListQueryDto,
  AdminSocietyResponseDto,
  AdminCreateSocietyDto,
  AdminUpdateSocietyDto,
  BootstrapAdminDto,
  BootstrapAdminResponseDto,
  AdminLeadListQueryDto,
  AdminLeadListResponseDto,
  CreateLeadDto,
  UpdateLeadDto,
  AddLeadNoteDto,
  UpdateLeadStatusDto,
  LeadPropertyContactDto,
  LeadResponseDto,
} from './dto';
import { JwtAuthGuard } from '../user/auth/guards/jwt-auth.guard';
import { AdminAuthGuard } from './guards/admin-auth.guard';
import { AdminPermissionsGuard } from './guards/admin-permissions.guard';
import { RequireAdminPermissions } from './decorators/admin-permissions.decorator';
import { AdminPermission } from './enum/admin-permission.enum';
import { CreateAdminUserDto, AdminUserResponseDto, AdminUserListResponseDto, UpdateAdminPermissionsDto } from './dto/admin-users.dto';

@ApiTags('Admin')
@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly leadService: LeadService,
  ) {}

  @Post('bootstrap')
  @ApiOperation({ summary: 'Bootstrap admin credentials (one-time operation)' })
  @ApiResponse({
    status: 201,
    description: 'Admin credentials created successfully',
    type: BootstrapAdminResponseDto,
  })
  async bootstrapAdmin(
    @Body() dto: BootstrapAdminDto,
  ): Promise<BootstrapAdminResponseDto> {
    return this.adminService.bootstrapAdmin(dto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Admin login with username and password' })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    type: AdminLoginResponseDto,
  })
  async login(@Body() dto: AdminLoginDto): Promise<AdminLoginResponseDto> {
    return this.adminService.login(dto);
  }

  @Get('properties')
  @UseGuards(AdminAuthGuard, AdminPermissionsGuard)
  @RequireAdminPermissions(AdminPermission.PROPERTY_MANAGEMENT)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'List all property listings with pagination' })
  @ApiResponse({
    status: 200,
    description: 'List of properties',
    type: AdminPropertyListResponseDto,
  })
  async listProperties(
    @Query() query: AdminPropertyListQueryDto,
  ): Promise<AdminPropertyListResponseDto> {
    return this.adminService.listProperties(query);
  }

  @Post('properties/:id/approve')
  @UseGuards(AdminAuthGuard, AdminPermissionsGuard)
  @RequireAdminPermissions(AdminPermission.PROPERTY_MANAGEMENT)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Approve a property listing with optional comment' })
  async approveProperty(
    @Param('id') propertyId: string,
    @Body() dto: AdminReviewPropertyDto,
    @Req() req: Request,
  ) {
    if (!req.admin) {
      throw new UnauthorizedException('Admin context missing');
    }
    return this.adminService.approveProperty(
      propertyId,
      dto,
      req.admin.id,
    );
  }

  @Post('properties/:id/reject')
  @UseGuards(AdminAuthGuard, AdminPermissionsGuard)
  @RequireAdminPermissions(AdminPermission.PROPERTY_MANAGEMENT)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Reject a property listing with comment' })
  async rejectProperty(
    @Param('id') propertyId: string,
    @Body() dto: AdminRejectPropertyDto,
    @Req() req: Request,
  ) {
    if (!req.admin) {
      throw new UnauthorizedException('Admin context missing');
    }
    return this.adminService.rejectProperty(
      propertyId,
      dto,
      req.admin.id,
    );
  }

  @Patch('properties/:id')
  @UseGuards(AdminAuthGuard, AdminPermissionsGuard)
  @RequireAdminPermissions(AdminPermission.PROPERTY_MANAGEMENT)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Edit any property fields as an admin' })
  @ApiResponse({
    status: 200,
    description: 'Property updated successfully',
  })
  async updateProperty(
    @Param('id') propertyId: string,
    @Body() dto: AdminUpdatePropertyDto,
    @Req() req: Request,
  ) {
    if (!req.admin) {
      throw new UnauthorizedException('Admin context missing');
    }
    return this.adminService.updatePropertyDetails(
      propertyId,
      dto,
      req.admin.id,
    );
  }

  @Delete('properties/:id')
  @UseGuards(AdminAuthGuard, AdminPermissionsGuard)
  @RequireAdminPermissions(AdminPermission.PROPERTY_MANAGEMENT)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Soft delete a property listing' })
  @ApiResponse({
    status: 200,
    description: 'Property deleted successfully',
  })
  async deleteProperty(
    @Param('id') propertyId: string,
    @Req() req: Request,
  ) {
    if (!req.admin) {
      throw new UnauthorizedException('Admin context missing');
    }
    return this.adminService.deleteProperty(propertyId, req.admin.id);
  }

  // City management
  @Get('cities')
  @UseGuards(AdminAuthGuard, AdminPermissionsGuard)
  @RequireAdminPermissions(AdminPermission.PROPERTY_MANAGEMENT)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'List cities with optional search' })
  @ApiResponse({
    status: 200,
    description: 'List of cities',
    type: [AdminCityResponseDto],
  })
  async listCities(
    @Query() query: AdminCityListQueryDto,
  ): Promise<{
    success: boolean;
    data: AdminCityResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    return this.adminService.listCities(query);
  }

  @Get('cities/:id')
  @UseGuards(AdminAuthGuard, AdminPermissionsGuard)
  @RequireAdminPermissions(AdminPermission.PROPERTY_MANAGEMENT)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get city detail' })
  async getCity(
    @Param('id') cityId: string,
  ): Promise<{ success: boolean; data: AdminCityResponseDto }> {
    return this.adminService.getCity(cityId);
  }

  @Post('cities')
  @UseGuards(AdminAuthGuard, AdminPermissionsGuard)
  @RequireAdminPermissions(AdminPermission.PROPERTY_MANAGEMENT)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Create a city' })
  async createCity(
    @Body() dto: AdminCreateCityDto,
  ): Promise<{ success: boolean; data: AdminCityResponseDto }> {
    return this.adminService.createCity(dto);
  }

  @Patch('cities/:id')
  @UseGuards(AdminAuthGuard, AdminPermissionsGuard)
  @RequireAdminPermissions(AdminPermission.PROPERTY_MANAGEMENT)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Update a city' })
  async updateCity(
    @Param('id') cityId: string,
    @Body() dto: AdminUpdateCityDto,
  ): Promise<{ success: boolean; data: AdminCityResponseDto }> {
    return this.adminService.updateCity(cityId, dto);
  }

  @Delete('cities/:id')
  @UseGuards(AdminAuthGuard, AdminPermissionsGuard)
  @RequireAdminPermissions(AdminPermission.PROPERTY_MANAGEMENT)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Delete a city' })
  async deleteCity(
    @Param('id') cityId: string,
  ): Promise<{ success: boolean; message: string; cityId: string }> {
    return this.adminService.deleteCity(cityId);
  }

  // Society management
  @Get('societies')
  @UseGuards(AdminAuthGuard, AdminPermissionsGuard)
  @RequireAdminPermissions(AdminPermission.PROPERTY_MANAGEMENT)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'List societies with optional filters' })
  async listSocieties(
    @Query() query: AdminSocietyListQueryDto,
  ): Promise<{
    success: boolean;
    data: AdminSocietyResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    return this.adminService.listSocieties(query);
  }

  @Get('societies/:id')
  @UseGuards(AdminAuthGuard, AdminPermissionsGuard)
  @RequireAdminPermissions(AdminPermission.PROPERTY_MANAGEMENT)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get society detail' })
  async getSociety(
    @Param('id') societyId: string,
  ): Promise<{ success: boolean; data: AdminSocietyResponseDto }> {
    return this.adminService.getSociety(societyId);
  }

  @Post('societies')
  @UseGuards(AdminAuthGuard, AdminPermissionsGuard)
  @RequireAdminPermissions(AdminPermission.PROPERTY_MANAGEMENT)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Create a society' })
  async createSociety(
    @Body() dto: AdminCreateSocietyDto,
  ): Promise<{ success: boolean; data: AdminSocietyResponseDto }> {
    return this.adminService.createSociety(dto);
  }

  @Patch('societies/:id')
  @UseGuards(AdminAuthGuard, AdminPermissionsGuard)
  @RequireAdminPermissions(AdminPermission.PROPERTY_MANAGEMENT)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Update a society' })
  async updateSociety(
    @Param('id') societyId: string,
    @Body() dto: AdminUpdateSocietyDto,
  ): Promise<{ success: boolean; data: AdminSocietyResponseDto }> {
    return this.adminService.updateSociety(societyId, dto);
  }

  @Delete('societies/:id')
  @UseGuards(AdminAuthGuard, AdminPermissionsGuard)
  @RequireAdminPermissions(AdminPermission.PROPERTY_MANAGEMENT)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Delete a society' })
  async deleteSociety(
    @Param('id') societyId: string,
  ): Promise<{ success: boolean; message: string; societyId: string }> {
    return this.adminService.deleteSociety(societyId);
  }

  // User management endpoints
  @Post('admins')
  @UseGuards(AdminAuthGuard, AdminPermissionsGuard)
  @RequireAdminPermissions(AdminPermission.USER_MANAGEMENT)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Create an admin user with role and permissions' })
  @ApiResponse({ status: 201, description: 'Admin user created', type: AdminUserResponseDto })
  async createAdminUser(@Body() dto: CreateAdminUserDto): Promise<AdminUserResponseDto> {
    return this.adminService.createAdminUser(dto);
  }

  @Get('admins')
  @UseGuards(AdminAuthGuard, AdminPermissionsGuard)
  @RequireAdminPermissions(AdminPermission.USER_MANAGEMENT)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'List admin users' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1, description: 'Page number (1-based)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20, description: 'Items per page (max 100)' })
  @ApiResponse({ status: 200, description: 'Paginated list of admin users', type: AdminUserListResponseDto })
  async listAdminUsers(
    @Query() query: { page?: number; limit?: number },
  ): Promise<AdminUserListResponseDto> {
    return this.adminService.listAdminUsers(query);
  }

  @Post('admins/:id/permissions')
  @UseGuards(AdminAuthGuard, AdminPermissionsGuard)
  @RequireAdminPermissions(AdminPermission.USER_MANAGEMENT)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Update an admin user permissions' })
  @ApiResponse({ status: 200, description: 'Admin user permissions updated', type: AdminUserResponseDto })
  async updateAdminPermissions(
    @Param('id') adminId: string,
    @Body() dto: UpdateAdminPermissionsDto,
  ): Promise<AdminUserResponseDto> {
    return this.adminService.updateAdminPermissions(adminId, dto);
  }

  // Lead management endpoints
  @Get('leads')
  @UseGuards(AdminAuthGuard, AdminPermissionsGuard)
  @RequireAdminPermissions(AdminPermission.PROPERTY_MANAGEMENT)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'List leads with filters and pagination' })
  @ApiResponse({
    status: 200,
    description: 'List of leads',
    type: AdminLeadListResponseDto,
  })
  async listLeads(
    @Query() query: AdminLeadListQueryDto,
  ): Promise<AdminLeadListResponseDto> {
    return this.leadService.listLeads(query);
  }

  @Get('leads/:id')
  @UseGuards(AdminAuthGuard, AdminPermissionsGuard)
  @RequireAdminPermissions(AdminPermission.PROPERTY_MANAGEMENT)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get lead details by ID' })
  @ApiResponse({
    status: 200,
    description: 'Lead details',
    type: LeadResponseDto,
  })
  async getLead(@Param('id') leadId: string): Promise<LeadResponseDto> {
    return this.leadService.getLeadById(leadId);
  }

  @Post('leads')
  @UseGuards(AdminAuthGuard, AdminPermissionsGuard)
  @RequireAdminPermissions(AdminPermission.PROPERTY_MANAGEMENT)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Create a new lead' })
  @ApiResponse({
    status: 201,
    description: 'Lead created successfully',
    type: LeadResponseDto,
  })
  async createLead(@Body() dto: CreateLeadDto): Promise<LeadResponseDto> {
    return this.leadService.createLead(dto);
  }

  @Patch('leads/:id')
  @UseGuards(AdminAuthGuard, AdminPermissionsGuard)
  @RequireAdminPermissions(AdminPermission.PROPERTY_MANAGEMENT)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Update a lead' })
  @ApiResponse({
    status: 200,
    description: 'Lead updated successfully',
    type: LeadResponseDto,
  })
  async updateLead(
    @Param('id') leadId: string,
    @Body() dto: UpdateLeadDto,
  ): Promise<LeadResponseDto> {
    return this.leadService.updateLead(leadId, dto);
  }

  @Post('leads/:id/status')
  @UseGuards(AdminAuthGuard, AdminPermissionsGuard)
  @RequireAdminPermissions(AdminPermission.PROPERTY_MANAGEMENT)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Update lead status' })
  @ApiResponse({
    status: 200,
    description: 'Lead status updated successfully',
    type: LeadResponseDto,
  })
  async updateLeadStatus(
    @Param('id') leadId: string,
    @Body() dto: UpdateLeadStatusDto,
  ): Promise<LeadResponseDto> {
    return this.leadService.updateLeadStatus(leadId, dto);
  }

  @Post('leads/:id/notes')
  @UseGuards(AdminAuthGuard, AdminPermissionsGuard)
  @RequireAdminPermissions(AdminPermission.PROPERTY_MANAGEMENT)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Add a note to a lead' })
  @ApiResponse({
    status: 201,
    description: 'Note added successfully',
  })
  async addNoteToLead(
    @Param('id') leadId: string,
    @Body() dto: AddLeadNoteDto,
    @Req() req: Request,
  ) {
    const adminId = req.admin?.id;
    return this.leadService.addNoteToLead(leadId, dto, adminId);
  }

  @Post('leads/:id/property-contacts')
  @UseGuards(AdminAuthGuard, AdminPermissionsGuard)
  @RequireAdminPermissions(AdminPermission.PROPERTY_MANAGEMENT)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Add a property contact to a lead' })
  @ApiResponse({
    status: 201,
    description: 'Property contact added successfully',
  })
  async addPropertyContact(
    @Param('id') leadId: string,
    @Body() dto: LeadPropertyContactDto,
  ) {
    return this.leadService.addPropertyContact(leadId, dto);
  }

  @Delete('leads/:id')
  @UseGuards(AdminAuthGuard, AdminPermissionsGuard)
  @RequireAdminPermissions(AdminPermission.PROPERTY_MANAGEMENT)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Delete a lead' })
  @ApiResponse({
    status: 200,
    description: 'Lead deleted successfully',
  })
  async deleteLead(@Param('id') leadId: string): Promise<{ success: boolean; message: string }> {
    await this.leadService.deleteLead(leadId);
    return { success: true, message: 'Lead deleted successfully' };
  }

  @Post('leads/sync-status')
  @UseGuards(AdminAuthGuard, AdminPermissionsGuard)
  @RequireAdminPermissions(AdminPermission.PROPERTY_MANAGEMENT)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Sync lead statuses' })
  @ApiResponse({
    status: 200,
    description: 'Lead statuses synced successfully',
  })
  async syncLeadStatus() {
    return this.leadService.syncLeadStatus();
  }

  @Get('leads/export')
  @UseGuards(AdminAuthGuard, AdminPermissionsGuard)
  @RequireAdminPermissions(AdminPermission.PROPERTY_MANAGEMENT)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Export leads' })
  @ApiResponse({
    status: 200,
    description: 'Leads exported successfully',
  })
  async exportLeads(@Query() query: AdminLeadListQueryDto) {
    const leads = await this.leadService.exportLeads(query);
    return {
      success: true,
      data: leads,
      total: leads.length,
    };
  }
}

