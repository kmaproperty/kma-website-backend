import {
  Body,
  Controller,
  Get,
  Param,
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
  BootstrapAdminDto,
  BootstrapAdminResponseDto,
} from './dto';
import { JwtAuthGuard } from '../user/auth/guards/jwt-auth.guard';

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
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
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
}

