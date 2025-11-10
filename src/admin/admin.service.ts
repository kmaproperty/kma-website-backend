import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { AdminRepository } from './repositories/admin.repository';
import { AdminLoginDto, AdminLoginResponseDto, AdminPropertyListQueryDto, AdminPropertyListResponseDto, AdminReviewPropertyDto, AdminRejectPropertyDto, BootstrapAdminDto, BootstrapAdminResponseDto } from './dto';
import { PropertyRepository } from '../property/repositories/property.repository';

@Injectable()
export class AdminService {
  private readonly ACCESS_TOKEN_EXPIRY = '12h';
  private readonly REFRESH_TOKEN_EXPIRY = '7d';

  constructor(
    private readonly adminRepository: AdminRepository,
    private readonly propertyRepository: PropertyRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  private getJwtSecret(): string {
    return (
      this.configService.get<string>('JWT_SECRET') || 'fallback-secret-key'
    );
  }

  private async generateTokens(admin: { id: string; username: string }) {
    const payload = {
      sub: admin.id,
      username: admin.username,
      role: 'ADMIN',
      type: 'admin_access_token',
    };
    const refreshPayload = {
      ...payload,
      type: 'admin_refresh_token',
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.getJwtSecret(),
      expiresIn: this.ACCESS_TOKEN_EXPIRY,
    });

    const refreshToken = await this.jwtService.signAsync(refreshPayload, {
      secret: this.getJwtSecret(),
      expiresIn: this.REFRESH_TOKEN_EXPIRY,
    });

    return { accessToken, refreshToken };
  }

  async bootstrapAdmin(
    dto: BootstrapAdminDto,
  ): Promise<BootstrapAdminResponseDto> {
    const count = await this.adminRepository.countAdmins();
    if (count > 0) {
      throw new BadRequestException(
        'Admin credentials already exist. Bootstrap not allowed.',
      );
    }

    const bootstrapSecret = this.configService.get<string>(
      'ADMIN_BOOTSTRAP_SECRET',
    );
    if (bootstrapSecret && dto.bootstrapSecret !== bootstrapSecret) {
      throw new UnauthorizedException('Invalid bootstrap secret');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    await this.adminRepository.createAdmin({
      username: dto.username,
      passwordHash,
    });

    return {
      success: true,
      message: 'Admin credentials created successfully',
    };
  }

  async login(dto: AdminLoginDto): Promise<AdminLoginResponseDto> {
    const admin = await this.adminRepository.findByUsername(dto.username);
    if (!admin) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordValid = await bcrypt.compare(
      dto.password,
      admin.passwordHash,
    );
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.generateTokens({
      id: admin.id,
      username: admin.username,
    });

    await this.adminRepository.updateAdmin(admin.id, {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });

    return {
      success: true,
      message: 'Login successful',
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      admin: {
        id: admin.id,
        username: admin.username,
      },
    };
  }

  async listProperties(
    query: AdminPropertyListQueryDto,
  ): Promise<AdminPropertyListResponseDto> {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 20));
    const offset = (page - 1) * limit;

    const { items, total } = await this.propertyRepository.findWithPagination({
      offset,
      limit,
      status: query.status,
    });

    const pick = (source: any, keys: string[]) => {
      if (!source) {
        return null;
      }
      return keys.reduce<Record<string, any>>((acc, key) => {
        if (key in source) {
          acc[key] = source[key];
        }
        return acc;
      }, {});
    };

    const data = items.map((property) => {
      const propertyData: Record<string, any> = {
        ...property,
        adminReviewComment: property.adminReviewComment ?? null,
        adminReviewedAt: property.adminReviewedAt ?? null,
        adminReviewedBy: property.adminReviewedBy ?? null,
      };

      const owner = property.user
        ? pick(property.user, [
            'id',
            'name',
            'email',
            'phone',
            'role',
            'intent',
            'cities',
            'phoneVerified',
            'isActive',
          ])
        : null;

      const listingType = pick(property.listingType, ['id', 'name', 'code']);
      const category = pick(property.category, ['id', 'name', 'code']);
      const propertyType = pick(property.propertyType, ['id', 'name', 'code']);
      const city = pick(property.city, [
        'id',
        'name',
        'code',
        'state',
        'latitude',
        'longitude',
      ]);
      const society = pick(property.society, [
        'id',
        'name',
        'localityName',
        'address',
        'pincode',
        'latitude',
        'longitude',
      ]);
      const locality = pick(property.locality, [
        'id',
        'name',
        'sector',
        'latitude',
        'longitude',
      ]);
      const bhkType = pick(property.bhkType, [
        'id',
        'name',
        'code',
        'sortOrder',
      ]);

      delete propertyData.user;
      delete propertyData.listingType;
      delete propertyData.category;
      delete propertyData.propertyType;
      delete propertyData.city;
      delete propertyData.society;
      delete propertyData.locality;
      delete propertyData.bhkType;

      propertyData.owner = owner;
      propertyData.listingType = listingType;
      propertyData.category = category;
      propertyData.propertyType = propertyType;
      propertyData.city = city;
      propertyData.society = society;
      propertyData.locality = locality;
      propertyData.bhkType = bhkType;

      return propertyData;
    });

    return {
      success: true,
      data,
      total,
      page,
      limit,
    };
  }

  private async ensurePropertyExists(propertyId: string) {
    const property = await this.propertyRepository.findByIdWithUser(propertyId);
    if (!property) {
      throw new BadRequestException(`Property with ID ${propertyId} not found`);
    }
    return property;
  }

  async approveProperty(
    propertyId: string,
    dto: AdminReviewPropertyDto,
    adminId: string,
  ) {
    const property = await this.ensurePropertyExists(propertyId);

    await this.propertyRepository.updateProperty(propertyId, {
      status: 'approved',
      adminReviewComment: dto.comment ?? null,
      adminReviewedBy: adminId,
      adminReviewedAt: new Date(),
    });

    return {
      success: true,
      message: 'Property approved successfully',
      propertyId: property.id,
      status: 'approved',
      adminReviewComment: dto.comment ?? null,
    };
  }

  async rejectProperty(
    propertyId: string,
    dto: AdminRejectPropertyDto,
    adminId: string,
  ) {
    const property = await this.ensurePropertyExists(propertyId);

    await this.propertyRepository.updateProperty(propertyId, {
      status: 'rejected',
      adminReviewComment: dto.comment,
      adminReviewedBy: adminId,
      adminReviewedAt: new Date(),
    });

    return {
      success: true,
      message: 'Property rejected successfully',
      propertyId: property.id,
      status: 'rejected',
      adminReviewComment: dto.comment,
    };
  }
}

