import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { AdminRepository } from './repositories/admin.repository';
import {
  AdminLoginDto,
  AdminLoginResponseDto,
  AdminPropertyListQueryDto,
  AdminPropertyListResponseDto,
  AdminReviewPropertyDto,
  AdminRejectPropertyDto,
  AdminUpdatePropertyDto,
  BootstrapAdminDto,
  BootstrapAdminResponseDto,
  CreateAdminUserDto,
  UpdateAdminPermissionsDto,
  AdminUserResponseDto,
  AdminUserListResponseDto,
  AdminUserListQueryDto,
} from './dto';
import { PropertyRepository } from '../property/repositories/property.repository';
import { PropertyService } from '../property/property.service';
import { AdminRole } from './enum/admin-role.enum';
import { AdminPermission } from './enum/admin-permission.enum';
import { Property } from '../property/entities/property.entity';
import { CreatePropertyStep1Dto } from '../property/dto/create-property.dto';
import { CreatePropertyStep2Dto } from '../property/dto/create-property-step2.dto';
import { CreatePropertyStep3Dto } from '../property/dto/create-property-step3.dto';
import { CreatePropertyStep4Dto } from '../property/dto/create-property-step4.dto';

const STEP1_FIELDS: readonly (keyof AdminUpdatePropertyDto)[] = [
  'listingTypeId',
  'categoryId',
  'propertyTypeId',
  'bhk',
  'city',
  'society',
  'locality',
  'constructionStatus',
  'possessionBy',
  'possessionTime',
  'builtUpArea',
  'builtUpAreaUnit',
  'carpetArea',
  'carpetAreaUnit',
  'suitableFor',
  'plotLength',
  'plotLengthUnit',
  'plotWidth',
  'plotWidthUnit',
  'plotFacingRoadWidth',
  'locationHub',
  'otherLocationHub',
  'zoneType',
  'propertyCondition',
  'wallConstructionStatus',
  'ownership',
  'entranceWidth',
  'entranceWidthUnit',
  'ceilingHeight',
  'ceilingHeightUnit',
  'locatedNear',
  'plotLandType',
  'constructionTypeOptions',
];

const STEP2_FIELDS: readonly (keyof AdminUpdatePropertyDto)[] = [
  'floorNumber',
  'totalFloors',
  'flatNumber',
  'towerBlock',
  'propertyAreaAcre',
  'tenantType',
  'companyOccupancy',
  'rentAvailability',
  'availableFromDate',
  'monthlyRent',
  'maintenanceType',
  'maintenanceChargeAmount',
  'securityDepositType',
  'securityDepositAmount',
  'lockInType',
  'lockInMonths',
  'brokerageType',
  'brokerageAmount',
  'isBrokerageNegotiable',
  'noOfStaircases',
  'privateParking',
  'publicParking',
  'isRentNegotiable',
  'dgUpsChargeIncluded',
  'electricityChargeIncluded',
  'waterChargeIncluded',
  'expectedRentIncrease',
  'expectedReturnOnInvestment',
  'taxGovtChargeIncluded',
  'isPreLeasedRented',
  'currentRentPerMonth',
  'leaseYears',
  'price',
  'plotArea',
  'plotAreaUnit',
  'plotNumber',
  'houseNumber',
  'villaNumber',
  'transactionType',
  'possessionStatus',
  'possessionDate',
  'plotPrice',
  'brokerage',
  'loanAvailable',
  'facing',
  'boundaryWall',
  'noOfOpenSides',
  'floorsAllowedForConstruction',
  'constructionDone',
  'constructionType',
  'cornerProperty',
  'ageOfProperty',
];

const STEP3_FIELDS: readonly (keyof AdminUpdatePropertyDto)[] = [
  'additionalRooms',
  'reservedParkingCovered',
  'reservedParkingOpen',
  'powerBackup',
  'furnishType',
  'isLiftAvailable',
  'minNumberOfSeats',
  'maxNumberOfSeats',
  'numberOfCabins',
  'numberOfMeetingRooms',
  'privateWashrooms',
  'publicWashrooms',
  'conferenceRoom',
  'receptionArea',
  'furnishingsCounts',
  'amenities',
  'propertyDescription',
  'waterSource',
];

const STEP4_FIELDS: readonly (keyof AdminUpdatePropertyDto)[] = [
  'photos',
  'videos',
];

@Injectable()
export class AdminService {
  private readonly ACCESS_TOKEN_EXPIRY = '12h';
  private readonly REFRESH_TOKEN_EXPIRY = '7d';

  constructor(
    private readonly adminRepository: AdminRepository,
    private readonly propertyRepository: PropertyRepository,
    private readonly propertyService: PropertyService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  private getJwtSecret(): string {
    return (
      this.configService.get<string>('JWT_SECRET') || 'fallback-secret-key'
    );
  }

  private async generateTokens(admin: { id: string; username: string; role: AdminRole }) {
    const payload = {
      sub: admin.id,
      username: admin.username,
      role: admin.role,
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
      role: AdminRole.SUPER_ADMIN,
      permissions: Object.values(AdminPermission),
    });

    return {
      success: true,
      message: 'Admin credentials created successfully',
    };
  }

  async createAdminUser(dto: CreateAdminUserDto): Promise<AdminUserResponseDto> {
    const exists = await this.adminRepository.findByUsername(dto.username);
    if (exists) {
      throw new BadRequestException('Username already exists');
    }
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const role = dto.role ?? AdminRole.ADMIN;
    const permissions =
      role === AdminRole.SUPER_ADMIN
        ? Object.values(AdminPermission)
        : dto.permissions ?? [];
    const admin = await this.adminRepository.createAdmin({
      username: dto.username,
      passwordHash,
      role,
      permissions,
    });
    return {
      id: admin.id,
      username: admin.username,
      role: admin.role,
      permissions: (admin.permissions ?? []) as AdminPermission[],
      createdAt: admin.createdAt,
    };
  }

  async listAdminUsers(query: AdminUserListQueryDto): Promise<AdminUserListResponseDto> {
    const page = Math.max(1, query?.page || 1);
    const limit = Math.min(100, Math.max(1, query?.limit || 20));
    const offset = (page - 1) * limit;

    const { items, total } = await this.adminRepository.findWithPagination({
      offset,
      limit,
    });
    return {
      items: items.map((a: any) => ({
        id: a.id,
        username: a.username,
        role: a.role,
        permissions: (a.permissions ?? []) as AdminPermission[],
        createdAt: a.createdAt,
        updatedAt: a.updatedAt,
      })),
      total,
      page,
      limit,
    };
  }

  async updateAdminPermissions(
    adminId: string,
    dto: UpdateAdminPermissionsDto,
  ): Promise<AdminUserResponseDto> {
    const admin = await this.adminRepository.findById(adminId);
    if (!admin) {
      throw new BadRequestException('Admin not found');
    }
    if (admin.role === AdminRole.SUPER_ADMIN) {
      throw new BadRequestException('Cannot modify SUPER_ADMIN permissions');
    }
    await this.adminRepository.updateAdmin(adminId, {
      permissions: dto.permissions ?? [],
    });
    const updated = await this.adminRepository.findById(adminId);
    return {
      id: updated!.id,
      username: updated!.username,
      role: updated!.role,
      permissions: (updated!.permissions ?? []) as AdminPermission[],
      createdAt: updated!.createdAt,
      updatedAt: updated!.updatedAt,
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

    const tokenAdmin: any = {
      id: admin.id,
      username: admin.username,
      role: admin.role,
    };
    const tokens = await this.generateTokens(tokenAdmin);

    await this.adminRepository.updateAdmin(admin.id, {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });

    return {
      success: true,
      message: 'Login successful',
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      admin: ({
        id: admin.id,
        username: admin.username,
        role: admin.role,
        permissions: admin.permissions ?? [],
      } as any),
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

  async deleteProperty(propertyId: string, adminId: string) {
    const property = await this.ensurePropertyExists(propertyId);

    await this.propertyRepository.updateProperty(propertyId, {
      isDeleted: true,
      adminReviewedBy: adminId,
      adminReviewedAt: new Date(),
    });

    return {
      success: true,
      message: 'Property deleted successfully',
      propertyId: property.id,
    };
  }

  async updatePropertyDetails(
    propertyId: string,
    dto: AdminUpdatePropertyDto,
    adminId: string,
  ) {
    if (!dto || Object.keys(dto).length === 0) {
      throw new BadRequestException('No fields provided to update');
    }

    let property = await this.ensurePropertyExists(propertyId);
    const propertyOwnerId = property.userId ?? property.user?.id;
    if (!propertyOwnerId) {
      throw new BadRequestException(
        'Property owner information missing. Cannot update property.',
      );
    }

    const step1Payload = this.pickStepFields(dto, STEP1_FIELDS);
    const step2Payload = this.pickStepFields(dto, STEP2_FIELDS);
    const step3Payload = this.pickStepFields(dto, STEP3_FIELDS);
    const step4Payload = this.pickStepFields(dto, STEP4_FIELDS);

    const hasStep1Changes = Object.keys(step1Payload).length > 0;
    const hasStep2Changes = Object.keys(step2Payload).length > 0;
    const hasStep3Changes = Object.keys(step3Payload).length > 0;
    const hasStep4Changes = Object.keys(step4Payload).length > 0;

    if (
      !hasStep1Changes &&
      !hasStep2Changes &&
      !hasStep3Changes &&
      !hasStep4Changes &&
      dto.status === undefined &&
      dto.completionStep === undefined &&
      dto.adminReviewComment === undefined &&
      dto.adminReviewedAt === undefined &&
      dto.adminReviewerId === undefined
    ) {
      throw new BadRequestException(
        'No editable property fields found in payload',
      );
    }

    if (hasStep1Changes) {
      const listingTypeId = dto.listingTypeId ?? property.listingTypeId;
      if (!listingTypeId) {
        throw new BadRequestException(
          'listingTypeId is required to edit basic property details',
        );
      }

      const categoryId = dto.categoryId ?? property.categoryId;
      if (!categoryId) {
        throw new BadRequestException(
          'categoryId is required to edit basic property details',
        );
      }

      const basePayload: CreatePropertyStep1Dto = {
        propertyId,
        listingTypeId,
        categoryId,
        status: dto.status ?? property.status,
      };

      await this.propertyService.createProperty(
        {
          ...basePayload,
          ...step1Payload,
        },
        propertyOwnerId,
      );

      property = await this.ensurePropertyExists(propertyId);
    }

    if (hasStep2Changes) {
      await this.propertyService.updatePropertyStep2(
        {
          propertyId,
          ...step2Payload,
        } as CreatePropertyStep2Dto,
        propertyOwnerId,
      );
      property = await this.ensurePropertyExists(propertyId);
    }

    if (hasStep3Changes) {
      await this.propertyService.updatePropertyStep3(
        {
          propertyId,
          ...step3Payload,
        } as CreatePropertyStep3Dto,
        propertyOwnerId,
      );
      property = await this.ensurePropertyExists(propertyId);
    }

    if (hasStep4Changes) {
      await this.propertyService.updatePropertyStep4(
        {
          propertyId,
          ...step4Payload,
        } as CreatePropertyStep4Dto,
        propertyOwnerId,
      );
      property = await this.ensurePropertyExists(propertyId);
    }

    const directUpdates: Partial<Property> = {};
    let touchedDirect = false;

    if (dto.status !== undefined && !hasStep1Changes) {
      directUpdates.status = dto.status;
      touchedDirect = true;
    }

    if (dto.completionStep !== undefined) {
      if (dto.completionStep < 0) {
        throw new BadRequestException('completionStep cannot be negative');
      }
      directUpdates.completionStep = dto.completionStep;
      touchedDirect = true;
    }

    const reviewerOverrideProvided =
      dto.adminReviewComment !== undefined ||
      dto.adminReviewedAt !== undefined ||
      dto.adminReviewerId !== undefined;

    if (reviewerOverrideProvided) {
      if (dto.adminReviewComment !== undefined) {
        const trimmedComment = dto.adminReviewComment?.trim();
        directUpdates.adminReviewComment =
          trimmedComment && trimmedComment.length > 0
            ? dto.adminReviewComment
            : null;
      }

      if (dto.adminReviewedAt !== undefined) {
        if (dto.adminReviewedAt) {
          const parsed = new Date(dto.adminReviewedAt);
          if (Number.isNaN(parsed.valueOf())) {
            throw new BadRequestException('Invalid adminReviewedAt timestamp');
          }
          directUpdates.adminReviewedAt = parsed;
        } else {
          directUpdates.adminReviewedAt = null;
        }
      } else if (dto.adminReviewComment !== undefined) {
        directUpdates.adminReviewedAt = new Date();
      }

      directUpdates.adminReviewedBy = dto.adminReviewerId ?? adminId;

      touchedDirect = true;
    }

    if (touchedDirect) {
      await this.propertyRepository.updateProperty(propertyId, directUpdates);
      property = await this.ensurePropertyExists(propertyId);
    }

    return {
      success: true,
      message: 'Property updated successfully',
      propertyId: property.id,
      status: property.status,
      completionStep: property.completionStep,
      adminReviewComment: property.adminReviewComment ?? null,
      adminReviewedAt: property.adminReviewedAt ?? null,
    };
  }

  private pickStepFields(
    dto: AdminUpdatePropertyDto,
    fields: readonly (keyof AdminUpdatePropertyDto)[],
  ): Record<string, any> {
    return fields.reduce<Record<string, any>>((acc, field) => {
      if (dto[field] !== undefined) {
        acc[field as string] = dto[field];
      }
      return acc;
    }, {});
  }
}

