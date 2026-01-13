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
  ApiParam,
} from '@nestjs/swagger';
import { Request } from 'express';
import { AdminService } from './admin.service';
import { LeadService } from './services/lead.service';
import {
  AdminLoginDto,
  AdminLoginResponseDto,
  AdminPropertyListQueryDto,
  AdminPropertyListResponseDto,
  AdminPropertyDetailResponseDto,
  AdminRejectPropertyDto,
  AdminReviewPropertyDto,
  AdminUpdatePropertyDto,
  AdminCityListQueryDto,
  AdminCityResponseDto,
  AdminCreateCityDto,
  AdminUpdateCityDto,
  AdminMarkCityFeaturedDto,
  AdminSocietyListQueryDto,
  AdminSocietyResponseDto,
  AdminCreateSocietyDto,
  AdminUpdateSocietyDto,
  AdminBhkListQueryDto,
  AdminBhkResponseDto,
  AdminCreateBhkDto,
  AdminUpdateBhkDto,
  AdminLocalityListQueryDto,
  AdminLocalityResponseDto,
  AdminCreateLocalityDto,
  AdminUpdateLocalityDto,
  AdminChannelPartnerCodeListQueryDto,
  AdminChannelPartnerCodeResponseDto,
  AdminCreateChannelPartnerCodeDto,
  AdminUpdateChannelPartnerCodeDto,
  AdminFurnishingListQueryDto,
  AdminFurnishingResponseDto,
  AdminCreateFurnishingDto,
  AdminUpdateFurnishingDto,
  AdminAmenityListQueryDto,
  AdminAmenityResponseDto,
  AdminCreateAmenityDto,
  AdminUpdateAmenityDto,
  AdminOwnerListQueryDto,
  AdminOwnerResponseDto,
  AdminChannelPartnerResponseDto,
  AdminOwnerListResponseDto,
  AdminUsersListResponseDto,
  AdminUserListResponseDto,
  BootstrapAdminDto,
  BootstrapAdminResponseDto,
  AdminLeadListQueryDto,
  AdminLeadListResponseDto,
  LeadResponseDto,
  AdminEditUserDto,
  AdminEditUserResponseDto,
  AdminBlockUserResponseDto,
  AdminUnblockUserResponseDto,
  AdminUserDetailResponseDto,
  AdminApproveLivePhotoDto,
  AdminApproveLivePhotoRequestDto,
  AdminApproveLivePhotoResponseDto,
  AdminApproveKycDto,
  AdminApproveKycRequestDto,
  AdminApproveKycResponseDto,
  AdminMarkTopPropertyDto,
  AdminMarkTopPropertyResponseDto,
  AdminRemoveTopPropertyDto,
  AdminRemoveTopPropertyResponseDto,
  AdminTopPropertiesListQueryDto,
  AdminTopPropertiesListResponseDto,
  AdminContactUsListQueryDto,
  AdminContactUsListResponseDto,
  AdminContactUsKmaQueryListQueryDto,
  AdminContactUsKmaQueryListResponseDto,
  AdminKmaRatingReviewListQueryDto,
  AdminKmaRatingReviewListResponseDto,
  AdminApproveRatingReviewDto,
  AdminApproveRatingReviewResponseDto,
  AdminPropertyVerificationListQueryDto,
  AdminPropertyVerificationListResponseDto,
  AdminPropertyVerificationDetailResponseDto,
  AdminApprovePropertyVerificationDto,
  AdminRejectPropertyVerificationDto,
  AdminPropertyVerificationActionResponseDto,
} from './dto';
import { JwtAuthGuard } from '../user/auth/guards/jwt-auth.guard';
import { AdminAuthGuard } from './guards/admin-auth.guard';
import { AdminPermissionsGuard } from './guards/admin-permissions.guard';
import { RequireAdminPermissions } from './decorators/admin-permissions.decorator';
import { AdminPermission } from './enum/admin-permission.enum';
import { CreateAdminUserDto, AdminUserResponseDto, UpdateAdminPermissionsDto, AdminPermissionsResponseDto } from './dto/admin-users.dto';

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

  @Get('properties/top')
  @UseGuards(AdminAuthGuard, AdminPermissionsGuard)
  @RequireAdminPermissions(AdminPermission.PROPERTY_MANAGEMENT)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'List top properties with pagination' })
  @ApiResponse({
    status: 200,
    description: 'Top properties list retrieved successfully',
    type: AdminTopPropertiesListResponseDto,
  })
  async listTopProperties(
    @Query() query: AdminTopPropertiesListQueryDto,
  ): Promise<AdminTopPropertiesListResponseDto> {
    return this.adminService.listTopProperties(query);
  }

  @Get('properties/:id')
  @UseGuards(AdminAuthGuard, AdminPermissionsGuard)
  @RequireAdminPermissions(AdminPermission.PROPERTY_MANAGEMENT)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get property details by ID' })
  @ApiResponse({
    status: 200,
    description: 'Property details retrieved successfully',
    type: AdminPropertyDetailResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Property not found',
  })
  async getPropertyById(
    @Param('id') propertyId: string,
  ): Promise<AdminPropertyDetailResponseDto> {
    return this.adminService.getPropertyById(propertyId);
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

  @Post('properties/:id/verify')
  @UseGuards(AdminAuthGuard, AdminPermissionsGuard)
  @RequireAdminPermissions(AdminPermission.PROPERTY_MANAGEMENT)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Verify an active property listing with optional comment' })
  @ApiResponse({
    status: 200,
    description: 'Property verified successfully',
  })
  async verifyProperty(
    @Param('id') propertyId: string,
    @Body() dto: AdminReviewPropertyDto,
    @Req() req: Request,
  ) {
    if (!req.admin) {
      throw new UnauthorizedException('Admin context missing');
    }
    return this.adminService.verifyProperty(
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
  @RequireAdminPermissions(AdminPermission.MASTER_DATA_MANAGEMENT)
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
  @RequireAdminPermissions(AdminPermission.MASTER_DATA_MANAGEMENT)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get city detail' })
  async getCity(
    @Param('id') cityId: string,
  ): Promise<{ success: boolean; data: AdminCityResponseDto }> {
    return this.adminService.getCity(cityId);
  }

  @Post('cities')
  @UseGuards(AdminAuthGuard, AdminPermissionsGuard)
  @RequireAdminPermissions(AdminPermission.MASTER_DATA_MANAGEMENT)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Create a city' })
  async createCity(
    @Body() dto: AdminCreateCityDto,
  ): Promise<{ success: boolean; data: AdminCityResponseDto }> {
    return this.adminService.createCity(dto);
  }

  @Patch('cities/:id')
  @UseGuards(AdminAuthGuard, AdminPermissionsGuard)
  @RequireAdminPermissions(AdminPermission.MASTER_DATA_MANAGEMENT)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Update a city' })
  async updateCity(
    @Param('id') cityId: string,
    @Body() dto: AdminUpdateCityDto,
  ): Promise<{ success: boolean; data: AdminCityResponseDto }> {
    return this.adminService.updateCity(cityId, dto);
  }

  @Patch('cities/:id/featured')
  @UseGuards(AdminAuthGuard, AdminPermissionsGuard)
  @RequireAdminPermissions(AdminPermission.MASTER_DATA_MANAGEMENT)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Mark city as featured or unfeatured' })
  @ApiResponse({
    status: 200,
    description: 'City featured status updated successfully',
    type: AdminCityResponseDto,
  })
  async markCityFeatured(
    @Param('id') cityId: string,
    @Body() dto: AdminMarkCityFeaturedDto,
  ): Promise<{ success: boolean; data: AdminCityResponseDto }> {
    return this.adminService.markCityFeatured(cityId, dto);
  }

  @Delete('cities/:id')
  @UseGuards(AdminAuthGuard, AdminPermissionsGuard)
  @RequireAdminPermissions(AdminPermission.MASTER_DATA_MANAGEMENT)
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
  @RequireAdminPermissions(AdminPermission.MASTER_DATA_MANAGEMENT)
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
  @RequireAdminPermissions(AdminPermission.MASTER_DATA_MANAGEMENT)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get society detail' })
  async getSociety(
    @Param('id') societyId: string,
  ): Promise<{ success: boolean; data: AdminSocietyResponseDto }> {
    return this.adminService.getSociety(societyId);
  }

  @Post('societies')
  @UseGuards(AdminAuthGuard, AdminPermissionsGuard)
  @RequireAdminPermissions(AdminPermission.MASTER_DATA_MANAGEMENT)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Create a society' })
  async createSociety(
    @Body() dto: AdminCreateSocietyDto,
  ): Promise<{ success: boolean; data: AdminSocietyResponseDto }> {
    return this.adminService.createSociety(dto);
  }

  @Patch('societies/:id')
  @UseGuards(AdminAuthGuard, AdminPermissionsGuard)
  @RequireAdminPermissions(AdminPermission.MASTER_DATA_MANAGEMENT)
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
  @RequireAdminPermissions(AdminPermission.MASTER_DATA_MANAGEMENT)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Delete a society' })
  async deleteSociety(
    @Param('id') societyId: string,
  ): Promise<{ success: boolean; message: string; societyId: string }> {
    return this.adminService.deleteSociety(societyId);
  }

  // BHK Type management
  @Get('bhks')
  @UseGuards(AdminAuthGuard, AdminPermissionsGuard)
  @RequireAdminPermissions(AdminPermission.MASTER_DATA_MANAGEMENT)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'List BHK types with optional filters' })
  @ApiResponse({
    status: 200,
    description: 'List of BHK types',
    type: [AdminBhkResponseDto],
  })
  async listBhks(
    @Query() query: AdminBhkListQueryDto,
  ): Promise<{
    success: boolean;
    data: AdminBhkResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    return this.adminService.listBhks(query);
  }

  @Get('bhks/:id')
  @UseGuards(AdminAuthGuard, AdminPermissionsGuard)
  @RequireAdminPermissions(AdminPermission.MASTER_DATA_MANAGEMENT)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get BHK type detail' })
  @ApiResponse({
    status: 200,
    description: 'BHK type details',
    type: AdminBhkResponseDto,
  })
  async getBhk(
    @Param('id') bhkId: string,
  ): Promise<{ success: boolean; data: AdminBhkResponseDto }> {
    return this.adminService.getBhk(bhkId);
  }

  @Post('bhks')
  @UseGuards(AdminAuthGuard, AdminPermissionsGuard)
  @RequireAdminPermissions(AdminPermission.MASTER_DATA_MANAGEMENT)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Create a BHK type' })
  @ApiResponse({
    status: 201,
    description: 'BHK type created successfully',
    type: AdminBhkResponseDto,
  })
  async createBhk(
    @Body() dto: AdminCreateBhkDto,
  ): Promise<{ success: boolean; data: AdminBhkResponseDto }> {
    return this.adminService.createBhk(dto);
  }

  @Patch('bhks/:id')
  @UseGuards(AdminAuthGuard, AdminPermissionsGuard)
  @RequireAdminPermissions(AdminPermission.MASTER_DATA_MANAGEMENT)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Update a BHK type' })
  @ApiResponse({
    status: 200,
    description: 'BHK type updated successfully',
    type: AdminBhkResponseDto,
  })
  async updateBhk(
    @Param('id') bhkId: string,
    @Body() dto: AdminUpdateBhkDto,
  ): Promise<{ success: boolean; data: AdminBhkResponseDto }> {
    return this.adminService.updateBhk(bhkId, dto);
  }

  @Delete('bhks/:id')
  @UseGuards(AdminAuthGuard, AdminPermissionsGuard)
  @RequireAdminPermissions(AdminPermission.MASTER_DATA_MANAGEMENT)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Delete a BHK type' })
  @ApiResponse({
    status: 200,
    description: 'BHK type deleted successfully',
  })
  async deleteBhk(
    @Param('id') bhkId: string,
  ): Promise<{ success: boolean; message: string; bhkId: string }> {
    return this.adminService.deleteBhk(bhkId);
  }

  // Locality management
  @Get('localities')
  @UseGuards(AdminAuthGuard, AdminPermissionsGuard)
  @RequireAdminPermissions(AdminPermission.MASTER_DATA_MANAGEMENT)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'List localities with optional filters' })
  @ApiResponse({
    status: 200,
    description: 'List of localities',
    type: [AdminLocalityResponseDto],
  })
  async listLocalities(
    @Query() query: AdminLocalityListQueryDto,
  ): Promise<{
    success: boolean;
    data: AdminLocalityResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    return this.adminService.listLocalities(query);
  }

  @Get('localities/:id')
  @UseGuards(AdminAuthGuard, AdminPermissionsGuard)
  @RequireAdminPermissions(AdminPermission.MASTER_DATA_MANAGEMENT)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get locality detail' })
  @ApiResponse({
    status: 200,
    description: 'Locality details',
    type: AdminLocalityResponseDto,
  })
  async getLocality(
    @Param('id') localityId: string,
  ): Promise<{ success: boolean; data: AdminLocalityResponseDto }> {
    return this.adminService.getLocality(localityId);
  }

  @Post('localities')
  @UseGuards(AdminAuthGuard, AdminPermissionsGuard)
  @RequireAdminPermissions(AdminPermission.MASTER_DATA_MANAGEMENT)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Create a locality' })
  @ApiResponse({
    status: 201,
    description: 'Locality created successfully',
    type: AdminLocalityResponseDto,
  })
  async createLocality(
    @Body() dto: AdminCreateLocalityDto,
  ): Promise<{ success: boolean; data: AdminLocalityResponseDto }> {
    return this.adminService.createLocality(dto);
  }

  @Patch('localities/:id')
  @UseGuards(AdminAuthGuard, AdminPermissionsGuard)
  @RequireAdminPermissions(AdminPermission.MASTER_DATA_MANAGEMENT)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Update a locality' })
  @ApiResponse({
    status: 200,
    description: 'Locality updated successfully',
    type: AdminLocalityResponseDto,
  })
  async updateLocality(
    @Param('id') localityId: string,
    @Body() dto: AdminUpdateLocalityDto,
  ): Promise<{ success: boolean; data: AdminLocalityResponseDto }> {
    return this.adminService.updateLocality(localityId, dto);
  }

  @Delete('localities/:id')
  @UseGuards(AdminAuthGuard, AdminPermissionsGuard)
  @RequireAdminPermissions(AdminPermission.MASTER_DATA_MANAGEMENT)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Delete a locality' })
  @ApiResponse({
    status: 200,
    description: 'Locality deleted successfully',
  })
  async deleteLocality(
    @Param('id') localityId: string,
  ): Promise<{ success: boolean; message: string; localityId: string }> {
    return this.adminService.deleteLocality(localityId);
  }

  // Furnishing management
  @Get('furnishings')
  @UseGuards(AdminAuthGuard, AdminPermissionsGuard)
  @RequireAdminPermissions(AdminPermission.MASTER_DATA_MANAGEMENT)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'List furnishings with optional search' })
  @ApiResponse({
    status: 200,
    description: 'List of furnishings',
    type: [AdminFurnishingResponseDto],
  })
  async listFurnishings(
    @Query() query: AdminFurnishingListQueryDto,
  ): Promise<{
    success: boolean;
    data: AdminFurnishingResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    return this.adminService.listFurnishings(query);
  }

  @Get('furnishings/:id')
  @UseGuards(AdminAuthGuard, AdminPermissionsGuard)
  @RequireAdminPermissions(AdminPermission.MASTER_DATA_MANAGEMENT)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get furnishing detail' })
  @ApiResponse({
    status: 200,
    description: 'Furnishing details',
    type: AdminFurnishingResponseDto,
  })
  async getFurnishing(
    @Param('id') furnishingId: string,
  ): Promise<{ success: boolean; data: AdminFurnishingResponseDto }> {
    return this.adminService.getFurnishing(furnishingId);
  }

  @Post('furnishings')
  @UseGuards(AdminAuthGuard, AdminPermissionsGuard)
  @RequireAdminPermissions(AdminPermission.MASTER_DATA_MANAGEMENT)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Create a furnishing' })
  @ApiResponse({
    status: 201,
    description: 'Furnishing created successfully',
    type: AdminFurnishingResponseDto,
  })
  async createFurnishing(
    @Body() dto: AdminCreateFurnishingDto,
  ): Promise<{ success: boolean; data: AdminFurnishingResponseDto }> {
    return this.adminService.createFurnishing(dto);
  }

  @Patch('furnishings/:id')
  @UseGuards(AdminAuthGuard, AdminPermissionsGuard)
  @RequireAdminPermissions(AdminPermission.MASTER_DATA_MANAGEMENT)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Update a furnishing' })
  @ApiResponse({
    status: 200,
    description: 'Furnishing updated successfully',
    type: AdminFurnishingResponseDto,
  })
  async updateFurnishing(
    @Param('id') furnishingId: string,
    @Body() dto: AdminUpdateFurnishingDto,
  ): Promise<{ success: boolean; data: AdminFurnishingResponseDto }> {
    return this.adminService.updateFurnishing(furnishingId, dto);
  }

  @Delete('furnishings/:id')
  @UseGuards(AdminAuthGuard, AdminPermissionsGuard)
  @RequireAdminPermissions(AdminPermission.MASTER_DATA_MANAGEMENT)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Delete a furnishing' })
  @ApiResponse({
    status: 200,
    description: 'Furnishing deleted successfully',
  })
  async deleteFurnishing(
    @Param('id') furnishingId: string,
  ): Promise<{ success: boolean; message: string; furnishingId: string }> {
    return this.adminService.deleteFurnishing(furnishingId);
  }

  // Amenity management
  @Get('amenities')
  @UseGuards(AdminAuthGuard, AdminPermissionsGuard)
  @RequireAdminPermissions(AdminPermission.MASTER_DATA_MANAGEMENT)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'List amenities with optional search' })
  @ApiResponse({
    status: 200,
    description: 'List of amenities',
    type: [AdminAmenityResponseDto],
  })
  async listAmenities(
    @Query() query: AdminAmenityListQueryDto,
  ): Promise<{
    success: boolean;
    data: AdminAmenityResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    return this.adminService.listAmenities(query);
  }

  @Get('amenities/:id')
  @UseGuards(AdminAuthGuard, AdminPermissionsGuard)
  @RequireAdminPermissions(AdminPermission.MASTER_DATA_MANAGEMENT)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get amenity detail' })
  @ApiResponse({
    status: 200,
    description: 'Amenity details',
    type: AdminAmenityResponseDto,
  })
  async getAmenity(
    @Param('id') amenityId: string,
  ): Promise<{ success: boolean; data: AdminAmenityResponseDto }> {
    return this.adminService.getAmenity(amenityId);
  }

  @Post('amenities')
  @UseGuards(AdminAuthGuard, AdminPermissionsGuard)
  @RequireAdminPermissions(AdminPermission.MASTER_DATA_MANAGEMENT)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Create an amenity' })
  @ApiResponse({
    status: 201,
    description: 'Amenity created successfully',
    type: AdminAmenityResponseDto,
  })
  async createAmenity(
    @Body() dto: AdminCreateAmenityDto,
  ): Promise<{ success: boolean; data: AdminAmenityResponseDto }> {
    return this.adminService.createAmenity(dto);
  }

  @Patch('amenities/:id')
  @UseGuards(AdminAuthGuard, AdminPermissionsGuard)
  @RequireAdminPermissions(AdminPermission.MASTER_DATA_MANAGEMENT)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Update an amenity' })
  @ApiResponse({
    status: 200,
    description: 'Amenity updated successfully',
    type: AdminAmenityResponseDto,
  })
  async updateAmenity(
    @Param('id') amenityId: string,
    @Body() dto: AdminUpdateAmenityDto,
  ): Promise<{ success: boolean; data: AdminAmenityResponseDto }> {
    return this.adminService.updateAmenity(amenityId, dto);
  }

  @Delete('amenities/:id')
  @UseGuards(AdminAuthGuard, AdminPermissionsGuard)
  @RequireAdminPermissions(AdminPermission.MASTER_DATA_MANAGEMENT)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Delete an amenity' })
  @ApiResponse({
    status: 200,
    description: 'Amenity deleted successfully',
  })
  async deleteAmenity(
    @Param('id') amenityId: string,
  ): Promise<{ success: boolean; message: string; amenityId: string }> {
    return this.adminService.deleteAmenity(amenityId);
  }

  // Channel Partner Code management
  @Get('channel-partner-codes')
  @UseGuards(AdminAuthGuard, AdminPermissionsGuard)
  @RequireAdminPermissions(AdminPermission.USER_MANAGEMENT)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'List channel partner codes with optional search' })
  @ApiResponse({
    status: 200,
    description: 'List of channel partner codes',
    type: [AdminChannelPartnerCodeResponseDto],
  })
  async listChannelPartnerCodes(
    @Query() query: AdminChannelPartnerCodeListQueryDto,
  ): Promise<{
    success: boolean;
    data: AdminChannelPartnerCodeResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    return this.adminService.listChannelPartnerCodes(query);
  }

  @Get('channel-partner-codes/:id')
  @UseGuards(AdminAuthGuard, AdminPermissionsGuard)
  @RequireAdminPermissions(AdminPermission.USER_MANAGEMENT)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get channel partner code detail' })
  @ApiResponse({
    status: 200,
    description: 'Channel partner code details',
    type: AdminChannelPartnerCodeResponseDto,
  })
  async getChannelPartnerCode(
    @Param('id') codeId: string,
  ): Promise<{ success: boolean; data: AdminChannelPartnerCodeResponseDto }> {
    return this.adminService.getChannelPartnerCode(codeId);
  }

  @Post('channel-partner-codes')
  @UseGuards(AdminAuthGuard, AdminPermissionsGuard)
  @RequireAdminPermissions(AdminPermission.USER_MANAGEMENT)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Create a channel partner code' })
  @ApiResponse({
    status: 201,
    description: 'Channel partner code created successfully',
    type: AdminChannelPartnerCodeResponseDto,
  })
  async createChannelPartnerCode(
    @Body() dto: AdminCreateChannelPartnerCodeDto,
  ): Promise<{ success: boolean; data: AdminChannelPartnerCodeResponseDto }> {
    return this.adminService.createChannelPartnerCode(dto);
  }

  @Patch('channel-partner-codes/:id')
  @UseGuards(AdminAuthGuard, AdminPermissionsGuard)
  @RequireAdminPermissions(AdminPermission.USER_MANAGEMENT)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Update a channel partner code' })
  @ApiResponse({
    status: 200,
    description: 'Channel partner code updated successfully',
    type: AdminChannelPartnerCodeResponseDto,
  })
  async updateChannelPartnerCode(
    @Param('id') codeId: string,
    @Body() dto: AdminUpdateChannelPartnerCodeDto,
  ): Promise<{ success: boolean; data: AdminChannelPartnerCodeResponseDto }> {
    return this.adminService.updateChannelPartnerCode(codeId, dto);
  }

  @Delete('channel-partner-codes/:id')
  @UseGuards(AdminAuthGuard, AdminPermissionsGuard)
  @RequireAdminPermissions(AdminPermission.USER_MANAGEMENT)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Delete a channel partner code' })
  @ApiResponse({
    status: 200,
    description: 'Channel partner code deleted successfully',
  })
  async deleteChannelPartnerCode(
    @Param('id') codeId: string,
  ): Promise<{ success: boolean; message: string; codeId: string }> {
    return this.adminService.deleteChannelPartnerCode(codeId);
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

  @Get('permissions')
  @UseGuards(AdminAuthGuard, AdminPermissionsGuard)
  @RequireAdminPermissions(AdminPermission.ADMIN_MANAGEMENT)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'List all available admin permissions' })
  @ApiResponse({ 
    status: 200, 
    description: 'List of all available admin permissions', 
    type: AdminPermissionsResponseDto 
  })
  async listPermissions(): Promise<AdminPermissionsResponseDto> {
    return this.adminService.listPermissions();
  }

  // User listing endpoints
  @Get('users')
  @UseGuards(AdminAuthGuard, AdminPermissionsGuard)
  @RequireAdminPermissions(AdminPermission.USER_MANAGEMENT)
  @ApiBearerAuth('access-token')
  @ApiOperation({ 
    summary: 'List all users with filters and pagination',
    description: 'Lists all users (OWNER, CHANNEL_PARTNER, END_USER). Can filter by role and search term. For channel partners, includes agreement completion status.'
  })
  @ApiResponse({
    status: 200,
    description: 'List of users',
    type: AdminOwnerListResponseDto,
  })
  async listUsers(
    @Query() query: AdminOwnerListQueryDto,
  ): Promise<AdminOwnerListResponseDto<AdminUsersListResponseDto>> {
    return this.adminService.listUsers(query);
  }

  // Lead management endpoints
  @Get('leads')
  @UseGuards(AdminAuthGuard, AdminPermissionsGuard)
  @RequireAdminPermissions(AdminPermission.LEAD_MANAGEMENT)
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
  @RequireAdminPermissions(AdminPermission.LEAD_MANAGEMENT)
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

  @Delete('leads/:id')
  @UseGuards(AdminAuthGuard, AdminPermissionsGuard)
  @RequireAdminPermissions(AdminPermission.LEAD_MANAGEMENT)
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

  @Get('leads/export')
  @UseGuards(AdminAuthGuard, AdminPermissionsGuard)
  @RequireAdminPermissions(AdminPermission.LEAD_MANAGEMENT)
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

  // User management endpoints
  @Get('users/:id')
  @UseGuards(AdminAuthGuard, AdminPermissionsGuard)
  @RequireAdminPermissions(AdminPermission.USER_MANAGEMENT)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get user details by ID' })
  @ApiResponse({
    status: 200,
    description: 'User details retrieved successfully',
    type: AdminUserDetailResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async getUserDetails(
    @Param('id') userId: string,
  ): Promise<{ success: boolean; data: AdminUserDetailResponseDto }> {
    return this.adminService.getUserDetails(userId);
  }

  @Post('users/:id/block')
  @UseGuards(AdminAuthGuard, AdminPermissionsGuard)
  @RequireAdminPermissions(AdminPermission.USER_MANAGEMENT)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Block a user' })
  @ApiResponse({
    status: 200,
    description: 'User blocked successfully',
    type: AdminBlockUserResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @ApiResponse({
    status: 400,
    description: 'User is already blocked',
  })
  async blockUser(
    @Param('id') userId: string,
  ): Promise<AdminBlockUserResponseDto> {
    return this.adminService.blockUser(userId);
  }

  @Post('users/:id/unblock')
  @UseGuards(AdminAuthGuard, AdminPermissionsGuard)
  @RequireAdminPermissions(AdminPermission.USER_MANAGEMENT)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Unblock a user' })
  @ApiResponse({
    status: 200,
    description: 'User unblocked successfully',
    type: AdminUnblockUserResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @ApiResponse({
    status: 400,
    description: 'User is not blocked',
  })
  async unblockUser(
    @Param('id') userId: string,
  ): Promise<AdminUnblockUserResponseDto> {
    return this.adminService.unblockUser(userId);
  }

  @Patch('users/:id')
  @UseGuards(AdminAuthGuard, AdminPermissionsGuard)
  @RequireAdminPermissions(AdminPermission.USER_MANAGEMENT)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Edit user details' })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
    type: AdminEditUserResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async editUser(
    @Param('id') userId: string,
    @Body() dto: AdminEditUserDto,
  ): Promise<AdminEditUserResponseDto> {
    return this.adminService.editUser(userId, dto);
  }

  @Post('users/:id/approve-live-photo')
  @UseGuards(AdminAuthGuard, AdminPermissionsGuard)
  @RequireAdminPermissions(AdminPermission.USER_MANAGEMENT)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Approve or reject live photo for channel partner KYC' })
  @ApiParam({
    name: 'id',
    description: 'User ID of the channel partner',
    example: 'd6f12fb4-0b88-4d36-8927-63a9dd86b321',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Live photo approval status updated successfully',
    type: AdminApproveLivePhotoResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @ApiResponse({
    status: 400,
    description: 'User is not a channel partner or has not uploaded live photo',
  })
  async approveLivePhoto(
    @Param('id') userId: string,
    @Body() dto: AdminApproveLivePhotoRequestDto,
    @Req() req: Request,
  ): Promise<AdminApproveLivePhotoResponseDto> {
    if (!req.admin) {
      throw new UnauthorizedException('Admin context missing');
    }
    return this.adminService.approveLivePhoto(
      { ...dto, userId },
      req.admin.id,
    );
  }

  @Post('users/:id/approve-kyc')
  @UseGuards(AdminAuthGuard, AdminPermissionsGuard)
  @RequireAdminPermissions(AdminPermission.USER_MANAGEMENT)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Approve or reject KYC for channel partner' })
  @ApiParam({
    name: 'id',
    description: 'User ID of the channel partner',
    example: 'd6f12fb4-0b88-4d36-8927-63a9dd86b321',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'KYC approval status updated successfully',
    type: AdminApproveKycResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @ApiResponse({
    status: 400,
    description: 'User is not a channel partner',
  })
  async approveKyc(
    @Param('id') userId: string,
    @Body() dto: AdminApproveKycRequestDto,
    @Req() req: Request,
  ): Promise<AdminApproveKycResponseDto> {
    if (!req.admin) {
      throw new UnauthorizedException('Admin context missing');
    }
    return this.adminService.approveKyc(
      { ...dto, userId },
      req.admin.id,
    );
  }

  // Contact Us management endpoints
  @Get('contact-us')
  @UseGuards(AdminAuthGuard, AdminPermissionsGuard)
  @RequireAdminPermissions(AdminPermission.LEAD_MANAGEMENT)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'List contact us submissions with pagination and search' })
  @ApiResponse({
    status: 200,
    description: 'List of contact us submissions',
    type: AdminContactUsListResponseDto,
  })
  async listContactUs(
    @Query() query: AdminContactUsListQueryDto,
  ): Promise<AdminContactUsListResponseDto> {
    return this.adminService.listContactUs(query);
  }

  @Get('contact-us-kma-queries')
  @UseGuards(AdminAuthGuard, AdminPermissionsGuard)
  @RequireAdminPermissions(AdminPermission.LEAD_MANAGEMENT)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'List contact us KMA queries with pagination and search' })
  @ApiResponse({
    status: 200,
    description: 'List of contact us KMA queries',
    type: AdminContactUsKmaQueryListResponseDto,
  })
  async listContactUsKmaQueries(
    @Query() query: AdminContactUsKmaQueryListQueryDto,
  ): Promise<AdminContactUsKmaQueryListResponseDto> {
    return this.adminService.listContactUsKmaQueries(query);
  }

  @Get('rating-reviews')
  @UseGuards(AdminAuthGuard, AdminPermissionsGuard)
  @RequireAdminPermissions(AdminPermission.LEAD_MANAGEMENT)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'List KMA ratings and reviews with pagination and search' })
  @ApiResponse({
    status: 200,
    description: 'List of KMA ratings and reviews',
    type: AdminKmaRatingReviewListResponseDto,
  })
  async listKmaRatingReviews(
    @Query() query: AdminKmaRatingReviewListQueryDto,
  ): Promise<AdminKmaRatingReviewListResponseDto> {
    return this.adminService.listKmaRatingReviews(query);
  }

  @Post('rating-reviews/:id/approve')
  @UseGuards(AdminAuthGuard, AdminPermissionsGuard)
  @RequireAdminPermissions(AdminPermission.LEAD_MANAGEMENT)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Approve rating review for home page display' })
  @ApiParam({
    name: 'id',
    description: 'Rating review ID',
    example: 'd6f12fb4-0b88-4d36-8927-63a9dd86b321',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Rating review approved successfully',
    type: AdminApproveRatingReviewResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Rating review not found',
  })
  async approveRatingReview(
    @Param('id') ratingReviewId: string,
    @Body() dto: AdminApproveRatingReviewDto,
    @Req() req: Request,
  ): Promise<AdminApproveRatingReviewResponseDto> {
    if (!req.admin) {
      throw new UnauthorizedException('Admin context missing');
    }
    return this.adminService.approveRatingReview(
      ratingReviewId,
      dto,
      req.admin.id,
      true, // isApproved = true
    );
  }

  @Post('rating-reviews/:id/disapprove')
  @UseGuards(AdminAuthGuard, AdminPermissionsGuard)
  @RequireAdminPermissions(AdminPermission.LEAD_MANAGEMENT)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Disapprove rating review (remove from home page display)' })
  @ApiParam({
    name: 'id',
    description: 'Rating review ID',
    example: 'd6f12fb4-0b88-4d36-8927-63a9dd86b321',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Rating review disapproved successfully',
    type: AdminApproveRatingReviewResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Rating review not found',
  })
  async disapproveRatingReview(
    @Param('id') ratingReviewId: string,
    @Body() dto: AdminApproveRatingReviewDto,
    @Req() req: Request,
  ): Promise<AdminApproveRatingReviewResponseDto> {
    if (!req.admin) {
      throw new UnauthorizedException('Admin context missing');
    }
    return this.adminService.approveRatingReview(
      ratingReviewId,
      dto,
      req.admin.id,
      false, // isApproved = false
    );
  }

  // Property Verification management endpoints
  @Get('property-verifications')
  @UseGuards(AdminAuthGuard, AdminPermissionsGuard)
  @RequireAdminPermissions(AdminPermission.LEAD_MANAGEMENT)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'List property verification requests with pagination and filtering' })
  @ApiResponse({
    status: 200,
    description: 'List of property verification requests',
    type: AdminPropertyVerificationListResponseDto,
  })
  async listPropertyVerifications(
    @Query() query: AdminPropertyVerificationListQueryDto,
  ): Promise<AdminPropertyVerificationListResponseDto> {
    return this.adminService.listPropertyVerifications(query);
  }

  @Get('property-verifications/:id')
  @UseGuards(AdminAuthGuard, AdminPermissionsGuard)
  @RequireAdminPermissions(AdminPermission.LEAD_MANAGEMENT)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get property verification request details' })
  @ApiResponse({
    status: 200,
    description: 'Verification request details',
    type: AdminPropertyVerificationDetailResponseDto,
  })
  async getPropertyVerificationDetail(
    @Param('id') verificationRequestId: string,
  ): Promise<AdminPropertyVerificationDetailResponseDto> {
    return this.adminService.getPropertyVerificationDetail(verificationRequestId);
  }

  @Post('property-verifications/:id/approve')
  @UseGuards(AdminAuthGuard, AdminPermissionsGuard)
  @RequireAdminPermissions(AdminPermission.LEAD_MANAGEMENT)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Approve property verification request' })
  @ApiResponse({
    status: 200,
    description: 'Verification request approved successfully',
    type: AdminPropertyVerificationActionResponseDto,
  })
  async approvePropertyVerification(
    @Param('id') verificationRequestId: string,
    @Body() dto: AdminApprovePropertyVerificationDto,
    @Req() req: Request,
  ): Promise<AdminPropertyVerificationActionResponseDto> {
    if (!req.admin) {
      throw new UnauthorizedException('Admin context missing');
    }
    return this.adminService.approvePropertyVerification(
      verificationRequestId,
      dto,
      req.admin.id,
    );
  }

  @Post('property-verifications/:id/reject')
  @UseGuards(AdminAuthGuard, AdminPermissionsGuard)
  @RequireAdminPermissions(AdminPermission.LEAD_MANAGEMENT)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Reject property verification request' })
  @ApiResponse({
    status: 200,
    description: 'Verification request rejected successfully',
    type: AdminPropertyVerificationActionResponseDto,
  })
  async rejectPropertyVerification(
    @Param('id') verificationRequestId: string,
    @Body() dto: AdminRejectPropertyVerificationDto,
    @Req() req: Request,
  ): Promise<AdminPropertyVerificationActionResponseDto> {
    if (!req.admin) {
      throw new UnauthorizedException('Admin context missing');
    }
    return this.adminService.rejectPropertyVerification(
      verificationRequestId,
      dto,
      req.admin.id,
    );
  }

  @Post('properties/:id/mark-top')
  @UseGuards(AdminAuthGuard, AdminPermissionsGuard)
  @RequireAdminPermissions(AdminPermission.PROPERTY_MANAGEMENT)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Mark property as top property' })
  @ApiParam({
    name: 'id',
    description: 'Property ID',
    example: 'd6f12fb4-0b88-4d36-8927-63a9dd86b321',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Property marked as top successfully',
    type: AdminMarkTopPropertyResponseDto,
  })
  async markTopProperty(
    @Param('id') propertyId: string,
  ): Promise<AdminMarkTopPropertyResponseDto> {
    return this.adminService.markTopProperty({ propertyId });
  }

  @Post('properties/:id/remove-top')
  @UseGuards(AdminAuthGuard, AdminPermissionsGuard)
  @RequireAdminPermissions(AdminPermission.PROPERTY_MANAGEMENT)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Remove property from top properties' })
  @ApiParam({
    name: 'id',
    description: 'Property ID',
    example: 'd6f12fb4-0b88-4d36-8927-63a9dd86b321',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Property removed from top successfully',
    type: AdminRemoveTopPropertyResponseDto,
  })
  async removeTopProperty(
    @Param('id') propertyId: string,
  ): Promise<AdminRemoveTopPropertyResponseDto> {
    return this.adminService.removeTopProperty({ propertyId });
  }

}

