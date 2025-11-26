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
import {
  AdminLoginDto,
  AdminLoginResponseDto,
  AdminPropertyListQueryDto,
  AdminPropertyListResponseDto,
  AdminRejectPropertyDto,
  AdminReviewPropertyDto,
  AdminUpdatePropertyDto,
  BootstrapAdminDto,
  BootstrapAdminResponseDto,
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
  constructor(private readonly adminService: AdminService) {}

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
}

