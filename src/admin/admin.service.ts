import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { AdminRepository } from './repositories/admin.repository';
import {
  AdminLoginDto,
  AdminLoginResponseDto,
  AdminPropertyListQueryDto,
  AdminPropertyListResponseDto,
  AdminPropertyDetailResponseDto,
  AdminReviewPropertyDto,
  AdminRejectPropertyDto,
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
  CitySummary,
  BootstrapAdminDto,
  BootstrapAdminResponseDto,
  CreateAdminUserDto,
  UpdateAdminPermissionsDto,
  AdminUserResponseDto,
  AdminUserListResponseDto,
  AdminUserListQueryDto,
  AdminPermissionsResponseDto,
  AdminChannelPartnerCodeListQueryDto,
  AdminChannelPartnerCodeResponseDto,
  AdminCreateChannelPartnerCodeDto,
  AdminUpdateChannelPartnerCodeDto,
  AdminOwnerListQueryDto,
  AdminOwnerResponseDto,
  AdminChannelPartnerResponseDto,
  AdminOwnerListResponseDto,
  AdminUsersListResponseDto,
  AdminFurnishingListQueryDto,
  AdminFurnishingResponseDto,
  AdminCreateFurnishingDto,
  AdminUpdateFurnishingDto,
  AdminAmenityListQueryDto,
  AdminAmenityResponseDto,
  AdminCreateAmenityDto,
  AdminUpdateAmenityDto,
  AdminEditUserDto,
  AdminEditUserResponseDto,
  AdminBlockUserResponseDto,
  AdminUnblockUserResponseDto,
  AdminUserDetailResponseDto,
  AdminApproveLivePhotoDto,
  AdminApproveLivePhotoResponseDto,
  AdminApproveKycDto,
  AdminApproveKycResponseDto,
} from './dto';
import { PropertyRepository } from '../property/repositories/property.repository';
import { CityRepository } from '../property/repositories/city.repository';
import { SocietyRepository } from '../property/repositories/society.repository';
import { BhkTypeRepository } from '../property/repositories/bhk-type.repository';
import { LocalityRepository } from '../property/repositories/locality.repository';
import { FurnishingRepository } from '../property/repositories/furnishing.repository';
import { AmenityRepository } from '../property/repositories/amenity.repository';
import { ChannelPartnerCodeRepository } from '../user/repositories/channel-partner-code.repository';
import { ChannelPartnerAgreementRepository } from '../user/repositories/channel-partner-agreement.repository';
import { UserRepository } from '../user/repositories/user.repository';
import { UserService } from '../user/user.service';
import { PropertyService } from '../property/property.service';
import { AgreementStatus } from '../user/entities/channel-partner-agreement.entity';
import { AdminRole } from './enum/admin-role.enum';
import { AdminPermission } from './enum/admin-permission.enum';
import { Property } from '../property/entities/property.entity';
import { MasterCity } from '../property/entities/master-city.entity';
import { MasterSociety } from '../property/entities/master-society.entity';
import { MasterBhkType } from '../property/entities/master-bhk-type.entity';
import { MasterLocality } from '../property/entities/master-locality.entity';
import { MasterFurnishing } from '../property/entities/master-furnishing.entity';
import { MasterAmenity } from '../property/entities/master-amenity.entity';
import { ChannelPartnerCode } from '../user/entities/channel-partner-code.entity';
import { User } from '../user/entities/user.entity';
import { UserRole } from '../user/enum/user-role.enum';
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
    private readonly cityRepository: CityRepository,
    private readonly societyRepository: SocietyRepository,
    private readonly bhkTypeRepository: BhkTypeRepository,
    private readonly localityRepository: LocalityRepository,
    private readonly furnishingRepository: FurnishingRepository,
    private readonly amenityRepository: AmenityRepository,
    private readonly channelPartnerCodeRepository: ChannelPartnerCodeRepository,
    private readonly channelPartnerAgreementRepository: ChannelPartnerAgreementRepository,
    private readonly userRepository: UserRepository,
    private readonly userService: UserService,
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

  async listPermissions(): Promise<AdminPermissionsResponseDto> {
    const permissions = Object.values(AdminPermission);
    return {
      permissions,
      total: permissions.length,
    };
  }

  async listCities(
    query: AdminCityListQueryDto,
  ): Promise<{
    success: boolean;
    data: AdminCityResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    const page = Math.max(1, query?.page || 1);
    const limit = Math.min(100, Math.max(1, query?.limit || 20));
    const search = query?.search?.trim();
    const { items, total } = await this.cityRepository.findPaginated({
      page,
      limit,
      search,
    });

    const data = items.map((city) => this.toCityResponse(city));
    return {
      success: true,
      data,
      total,
      page,
      limit,
    };
  }

  async getCity(
    cityId: string,
  ): Promise<{ success: boolean; data: AdminCityResponseDto }> {
    const city = await this.ensureCityExists(cityId);
    return {
      success: true,
      data: this.toCityResponse(city),
    };
  }

  async createCity(
    dto: AdminCreateCityDto,
  ): Promise<{ success: boolean; data: AdminCityResponseDto }> {
    const normalizedCode = this.normalizeCityCode(dto.code);
    const existing = await this.cityRepository.findByCode(normalizedCode);
    if (existing) {
      throw new BadRequestException(
        `City code "${normalizedCode}" already exists`,
      );
    }

    const city = await this.cityRepository.createCity({
      name: dto.name.trim(),
      code: normalizedCode,
      state: dto.state?.trim() ?? null,
      latitude: dto.latitude ?? null,
      longitude: dto.longitude ?? null,
      isFeatured: dto.isFeatured ?? false,
    });

    return {
      success: true,
      data: this.toCityResponse(city),
    };
  }

  async updateCity(
    cityId: string,
    dto: AdminUpdateCityDto,
  ): Promise<{ success: boolean; data: AdminCityResponseDto }> {
    const city = await this.ensureCityExists(cityId);

    let normalizedCode: string | undefined;
    if (dto.code) {
      normalizedCode = this.normalizeCityCode(dto.code);
      if (normalizedCode !== city.code) {
        const duplicate = await this.cityRepository.findByCode(normalizedCode);
        if (duplicate && duplicate.id !== cityId) {
          throw new BadRequestException(
            `City code "${normalizedCode}" already exists`,
          );
        }
      }
    }

    await this.cityRepository.updateCity(cityId, {
      ...dto,
      name: dto.name?.trim() ?? dto.name,
      code: normalizedCode ?? dto.code ?? city.code,
      state: dto.state?.trim() ?? dto.state,
      isFeatured: dto.isFeatured !== undefined ? dto.isFeatured : city.isFeatured,
    });

    const updated = await this.ensureCityExists(cityId);
    return {
      success: true,
      data: this.toCityResponse(updated),
    };
  }

  async markCityFeatured(
    cityId: string,
    dto: AdminMarkCityFeaturedDto,
  ): Promise<{ success: boolean; data: AdminCityResponseDto }> {
    await this.ensureCityExists(cityId);
    await this.cityRepository.updateCity(cityId, {
      isFeatured: dto.isFeatured,
    });
    const updated = await this.ensureCityExists(cityId);
    return {
      success: true,
      data: this.toCityResponse(updated),
    };
  }

  async deleteCity(
    cityId: string,
  ): Promise<{ success: boolean; message: string; cityId: string }> {
    await this.ensureCityExists(cityId);
    const societies = await this.societyRepository.findByCityId(cityId);
    if (societies.length > 0) {
      throw new BadRequestException(
        'Cannot delete city while societies exist. Delete or reassign societies first.',
      );
    }

    await this.cityRepository.deleteCity(cityId);
    return {
      success: true,
      message: 'City deleted successfully',
      cityId,
    };
  }

  async listSocieties(
    query: AdminSocietyListQueryDto,
  ): Promise<{
    success: boolean;
    data: AdminSocietyResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    const page = Math.max(1, query?.page || 1);
    const limit = Math.min(100, Math.max(1, query?.limit || 20));
    const search = query?.search?.trim();

    const { items, total } = await this.societyRepository.findPaginated({
      page,
      limit,
      search,
      cityId: query?.cityId,
    });

    const cityCache = new Map<string, CitySummary | null>();
    const data: AdminSocietyResponseDto[] = [];
    for (const society of items) {
      const citySummary = await this.getCitySummaryForSociety(
        society,
        cityCache,
      );
      data.push(this.toSocietyResponse(society, citySummary));
    }

    return {
      success: true,
      data,
      total,
      page,
      limit,
    };
  }

  async getSociety(
    societyId: string,
  ): Promise<{ success: boolean; data: AdminSocietyResponseDto }> {
    const society = await this.ensureSocietyExists(societyId);
    const citySummary = await this.getCitySummaryForSociety(
      society,
      new Map<string, CitySummary | null>(),
    );
    return {
      success: true,
      data: this.toSocietyResponse(society, citySummary),
    };
  }

  async createSociety(
    dto: AdminCreateSocietyDto,
  ): Promise<{ success: boolean; data: AdminSocietyResponseDto }> {
    const city = await this.ensureCityExists(dto.cityId);
    const society = await this.societyRepository.createSociety({
      name: dto.name.trim(),
      cityId: dto.cityId,
      localityName: dto.localityName?.trim() ?? null,
      address: dto.address?.trim() ?? null,
      latitude: dto.latitude ?? null,
      longitude: dto.longitude ?? null,
      pincode: dto.pincode?.trim() ?? null,
      isVerified: dto.isVerified ?? false,
    });

    return {
      success: true,
      data: this.toSocietyResponse(society, this.toCitySummary(city)),
    };
  }

  async updateSociety(
    societyId: string,
    dto: AdminUpdateSocietyDto,
  ): Promise<{ success: boolean; data: AdminSocietyResponseDto }> {
    const society = await this.ensureSocietyExists(societyId);
    let citySummary: CitySummary | null = null;

    if (dto.cityId) {
      const newCity = await this.ensureCityExists(dto.cityId);
      citySummary = this.toCitySummary(newCity);
    }

    await this.societyRepository.updateSociety(societyId, {
      ...dto,
      name: dto.name?.trim() ?? dto.name,
      localityName: dto.localityName?.trim() ?? dto.localityName,
      address: dto.address?.trim() ?? dto.address,
      pincode: dto.pincode?.trim() ?? dto.pincode,
    });

    const updated = await this.ensureSocietyExists(societyId);
    const summary =
      citySummary ??
      (await this.getCitySummaryForSociety(
        updated,
        new Map<string, CitySummary | null>(),
      ));
    return {
      success: true,
      data: this.toSocietyResponse(updated, summary),
    };
  }

  async deleteSociety(
    societyId: string,
  ): Promise<{ success: boolean; message: string; societyId: string }> {
    await this.ensureSocietyExists(societyId);
    await this.societyRepository.deleteSociety(societyId);
    return {
      success: true,
      message: 'Society deleted successfully',
      societyId,
    };
  }

  // BHK Type management
  async listBhks(
    query: AdminBhkListQueryDto,
  ): Promise<{
    success: boolean;
    data: AdminBhkResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    const page = Math.max(1, query?.page || 1);
    const limit = Math.min(100, Math.max(1, query?.limit || 20));
    const search = query?.search?.trim();

    const { items, total } = await this.bhkTypeRepository.findPaginated({
      page,
      limit,
      search,
      propertyTypeId: query?.propertyTypeId,
      societyId: query?.societyId,
      localityId: query?.localityId,
    });

    const data = items.map((bhk) => this.toBhkResponse(bhk));
    return {
      success: true,
      data,
      total,
      page,
      limit,
    };
  }

  async getBhk(
    bhkId: string,
  ): Promise<{ success: boolean; data: AdminBhkResponseDto }> {
    const bhk = await this.ensureBhkExists(bhkId);
    return {
      success: true,
      data: this.toBhkResponse(bhk),
    };
  }

  async createBhk(
    dto: AdminCreateBhkDto,
  ): Promise<{ success: boolean; data: AdminBhkResponseDto }> {
    // Validate property type exists (we'll check via a BHK query or just let DB constraint handle it)
    // For now, we'll let the database foreign key constraint handle validation
    
    // Check if code already exists for the same property type
    const existing = await this.bhkTypeRepository.findByCode(dto.code);
    if (existing && existing.propertyTypeId === dto.propertyTypeId) {
      throw new BadRequestException(
        `BHK type with code "${dto.code}" already exists for this property type`,
      );
    }

    const bhk = await this.bhkTypeRepository.createBhkType({
      name: dto.name.trim(),
      code: dto.code.trim(),
      sortOrder: dto.sortOrder,
      propertyTypeId: dto.propertyTypeId,
      societyId: dto.societyId ?? null,
      localityId: dto.localityId ?? null,
    });

    return {
      success: true,
      data: this.toBhkResponse(bhk),
    };
  }

  async updateBhk(
    bhkId: string,
    dto: AdminUpdateBhkDto,
  ): Promise<{ success: boolean; data: AdminBhkResponseDto }> {
    const bhk = await this.ensureBhkExists(bhkId);

    // If code is being updated, check for duplicates
    if (dto.code && dto.code !== bhk.code) {
      const existing = await this.bhkTypeRepository.findByCode(dto.code);
      const propertyTypeId = dto.propertyTypeId ?? bhk.propertyTypeId;
      if (existing && existing.id !== bhkId && existing.propertyTypeId === propertyTypeId) {
        throw new BadRequestException(
          `BHK type with code "${dto.code}" already exists for this property type`,
        );
      }
    }

    await this.bhkTypeRepository.updateBhkType(bhkId, {
      ...dto,
      name: dto.name?.trim() ?? dto.name,
      code: dto.code?.trim() ?? dto.code,
    });

    const updated = await this.ensureBhkExists(bhkId);
    return {
      success: true,
      data: this.toBhkResponse(updated),
    };
  }

  async deleteBhk(
    bhkId: string,
  ): Promise<{ success: boolean; message: string; bhkId: string }> {
    await this.ensureBhkExists(bhkId);
    await this.bhkTypeRepository.deleteBhkType(bhkId);
    return {
      success: true,
      message: 'BHK type deleted successfully',
      bhkId,
    };
  }

  // Locality management
  async listLocalities(
    query: AdminLocalityListQueryDto,
  ): Promise<{
    success: boolean;
    data: AdminLocalityResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    const page = Math.max(1, query?.page || 1);
    const limit = Math.min(100, Math.max(1, query?.limit || 20));
    const search = query?.search?.trim();

    const { items, total } = await this.localityRepository.findPaginated({
      page,
      limit,
      search,
      cityId: query?.cityId,
    });

    const cityCache = new Map<string, CitySummary | null>();
    const data: AdminLocalityResponseDto[] = [];
    for (const locality of items) {
      const citySummary = await this.getCitySummaryForLocality(
        locality,
        cityCache,
      );
      data.push(this.toLocalityResponse(locality, citySummary));
    }

    return {
      success: true,
      data,
      total,
      page,
      limit,
    };
  }

  async getLocality(
    localityId: string,
  ): Promise<{ success: boolean; data: AdminLocalityResponseDto }> {
    const locality = await this.ensureLocalityExists(localityId);
    const citySummary = await this.getCitySummaryForLocality(
      locality,
      new Map<string, CitySummary | null>(),
    );
    return {
      success: true,
      data: this.toLocalityResponse(locality, citySummary),
    };
  }

  async createLocality(
    dto: AdminCreateLocalityDto,
  ): Promise<{ success: boolean; data: AdminLocalityResponseDto }> {
    const city = await this.ensureCityExists(dto.cityId);
    const locality = await this.localityRepository.createLocality({
      name: dto.name.trim(),
      sector: dto.sector?.trim() ?? (null as any),
      cityId: dto.cityId,
      latitude: dto.latitude ?? (null as any),
      longitude: dto.longitude ?? (null as any),
    });

    return {
      success: true,
      data: this.toLocalityResponse(locality, this.toCitySummary(city)),
    };
  }

  async updateLocality(
    localityId: string,
    dto: AdminUpdateLocalityDto,
  ): Promise<{ success: boolean; data: AdminLocalityResponseDto }> {
    const locality = await this.ensureLocalityExists(localityId);
    let citySummary: CitySummary | null = null;

    if (dto.cityId) {
      const newCity = await this.ensureCityExists(dto.cityId);
      citySummary = this.toCitySummary(newCity);
    }

    await this.localityRepository.updateLocality(localityId, {
      ...dto,
      name: dto.name?.trim() ?? dto.name ?? undefined,
      sector: dto.sector?.trim() ?? dto.sector ?? undefined,
      latitude: dto.latitude ?? undefined,
      longitude: dto.longitude ?? undefined,
    });

    const updated = await this.ensureLocalityExists(localityId);
    const summary =
      citySummary ??
      (await this.getCitySummaryForLocality(
        updated,
        new Map<string, CitySummary | null>(),
      ));
    return {
      success: true,
      data: this.toLocalityResponse(updated, summary),
    };
  }

  async deleteLocality(
    localityId: string,
  ): Promise<{ success: boolean; message: string; localityId: string }> {
    await this.ensureLocalityExists(localityId);
    await this.localityRepository.deleteLocality(localityId);
    return {
      success: true,
      message: 'Locality deleted successfully',
      localityId,
    };
  }

  // Channel Partner Code management
  async listChannelPartnerCodes(
    query: AdminChannelPartnerCodeListQueryDto,
  ): Promise<{
    success: boolean;
    data: AdminChannelPartnerCodeResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    const page = Math.max(1, query?.page || 1);
    const limit = Math.min(100, Math.max(1, query?.limit || 20));
    const search = query?.search?.trim();

    const { items, total } = await this.channelPartnerCodeRepository.findPaginated({
      page,
      limit,
      search,
    });

    const data = items.map((code) => this.toChannelPartnerCodeResponse(code));
    return {
      success: true,
      data,
      total,
      page,
      limit,
    };
  }

  async getChannelPartnerCode(
    codeId: string,
  ): Promise<{ success: boolean; data: AdminChannelPartnerCodeResponseDto }> {
    const code = await this.ensureChannelPartnerCodeExists(codeId);
    return {
      success: true,
      data: this.toChannelPartnerCodeResponse(code),
    };
  }

  async createChannelPartnerCode(
    dto: AdminCreateChannelPartnerCodeDto,
  ): Promise<{ success: boolean; data: AdminChannelPartnerCodeResponseDto }> {
    // Check if code already exists
    const existing = await this.channelPartnerCodeRepository.findByCode(dto.code.trim());
    if (existing) {
      throw new BadRequestException(
        `Channel partner code "${dto.code.trim()}" already exists`,
      );
    }

    const code = await this.channelPartnerCodeRepository.create({
      code: dto.code.trim(),
    });

    return {
      success: true,
      data: this.toChannelPartnerCodeResponse(code),
    };
  }

  async updateChannelPartnerCode(
    codeId: string,
    dto: AdminUpdateChannelPartnerCodeDto,
  ): Promise<{ success: boolean; data: AdminChannelPartnerCodeResponseDto }> {
    const code = await this.ensureChannelPartnerCodeExists(codeId);

    // If code is being updated, check for duplicates
    if (dto.code && dto.code.trim() !== code.code) {
      const existing = await this.channelPartnerCodeRepository.findByCode(dto.code.trim());
      if (existing && existing.id !== codeId) {
        throw new BadRequestException(
          `Channel partner code "${dto.code.trim()}" already exists`,
        );
      }
    }

    await this.channelPartnerCodeRepository.update(codeId, {
      code: dto.code?.trim() ?? code.code,
    });

    const updated = await this.ensureChannelPartnerCodeExists(codeId);
    return {
      success: true,
      data: this.toChannelPartnerCodeResponse(updated),
    };
  }

  async deleteChannelPartnerCode(
    codeId: string,
  ): Promise<{ success: boolean; message: string; codeId: string }> {
    await this.ensureChannelPartnerCodeExists(codeId);
    await this.channelPartnerCodeRepository.delete(codeId);
    return {
      success: true,
      message: 'Channel partner code deleted successfully',
      codeId,
    };
  }

  async listUsers(
    query: AdminOwnerListQueryDto,
  ): Promise<AdminOwnerListResponseDto<AdminUsersListResponseDto>> {
    const page = Math.max(1, query?.page || 1);
    const limit = Math.min(100, Math.max(1, query?.limit || 20));
    const search = query?.search?.trim();

    const { items, total } = await this.userRepository.findPaginated({
      page,
      limit,
      role: query?.role, // Optional role filter - can be undefined to get all users
      search,
    });

    // Separate users by role
    const channelPartnerIds = items
      .filter((user) => user.role === UserRole.CHANNEL_PARTNER)
      .map((user) => user.id);

    // Fetch agreement status for channel partners only
    const agreementStatusMap = new Map<string, boolean>();
    for (const userId of channelPartnerIds) {
      const latestAgreement = await this.channelPartnerAgreementRepository.findLatestByUserId(userId);
      const isAgreementCompleted = latestAgreement?.status === AgreementStatus.COMPLETED;
      agreementStatusMap.set(userId, isAgreementCompleted ?? false);
    }

    const data = items.map((user) => {
      const baseData: AdminUsersListResponseDto = {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive,
        isBlocked: user.isBlocked,
        phoneVerified: user.phoneVerified,
        intent: user.intent ?? null,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };

      // Add channel partner specific fields
      if (user.role === UserRole.CHANNEL_PARTNER) {
        baseData.isAgreementCompleted = agreementStatusMap.get(user.id) ?? false;
        baseData.channelPartnerCode = user.channelPartnerCode ?? null;
        baseData.firmName = user.firmName ?? null;
        baseData.cities = user.cities ?? null;
        baseData.businessSince = user.businessSince ?? null;
        baseData.aboutYourSelf = user.aboutYourSelf ?? null;
      }

      return baseData;
    });

    return {
      success: true,
      data,
      total,
      page,
      limit,
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

  private pick(source: any, keys: string[]): Record<string, any> | null {
    if (!source) {
      return null;
    }
    return keys.reduce<Record<string, any>>((acc, key) => {
      if (key in source) {
        acc[key] = source[key];
      }
      return acc;
    }, {});
  }

  private formatPropertyData(property: any): Record<string, any> {
    const propertyData: Record<string, any> = {
      ...property,
      adminReviewComment: property.adminReviewComment ?? null,
      adminReviewedAt: property.adminReviewedAt ?? null,
      adminReviewedBy: property.adminReviewedBy ?? null,
    };

    const owner = property.user
      ? this.pick(property.user, [
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

    const listingType = this.pick(property.listingType, ['id', 'name', 'code']);
    const category = this.pick(property.category, ['id', 'name', 'code']);
    const propertyType = this.pick(property.propertyType, ['id', 'name', 'code']);
    const city = this.pick(property.city, [
      'id',
      'name',
      'code',
      'state',
      'latitude',
      'longitude',
    ]);
    const society = this.pick(property.society, [
      'id',
      'name',
      'localityName',
      'address',
      'pincode',
      'latitude',
      'longitude',
    ]);
    const locality = this.pick(property.locality, [
      'id',
      'name',
      'sector',
      'latitude',
      'longitude',
    ]);
    const bhkType = this.pick(property.bhkType, [
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

    const data = items.map((property) => this.formatPropertyData(property));

    return {
      success: true,
      data,
      total,
      page,
      limit,
    };
  }

  async getPropertyById(
    propertyId: string,
  ): Promise<AdminPropertyDetailResponseDto> {
    const property = await this.propertyRepository.findByIdWithRelations(propertyId);

    if (!property) {
      throw new BadRequestException(`Property with ID ${propertyId} not found`);
    }

    const data = this.formatPropertyData(property);

    return {
      success: true,
      data,
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

    // Calculate expiry date: 15 days from now
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 15);

    await this.propertyRepository.updateProperty(propertyId, {
      status: 'approved',
      adminReviewComment: dto.comment ?? null,
      adminReviewedBy: adminId,
      adminReviewedAt: new Date(),
      expiresAt,
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
      // If status is being set to 'approved', set expiry date to 15 days from now
      if (dto.status === 'approved') {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 15);
        directUpdates.expiresAt = expiresAt;
      }
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

  private normalizeCityCode(code: string): string {
    return code.trim().toLowerCase().replace(/\s+/g, '-');
  }

  private toCityResponse(city: MasterCity): AdminCityResponseDto {
    return {
      id: city.id,
      name: city.name,
      code: city.code,
      state: city.state ?? null,
      latitude:
        city.latitude === null || city.latitude === undefined
          ? null
          : Number(city.latitude),
      longitude:
        city.longitude === null || city.longitude === undefined
          ? null
          : Number(city.longitude),
      isFeatured: city.isFeatured ?? false,
      createdAt: city.createdAt,
      updatedAt: city.updatedAt,
    };
  }

  private toCitySummary(city: MasterCity | null): CitySummary | null {
    if (!city) {
      return null;
    }
    return {
      id: city.id,
      name: city.name,
      code: city.code,
    };
  }

  private toSocietyResponse(
    society: MasterSociety,
    citySummary: CitySummary | null,
  ): AdminSocietyResponseDto {
    return {
      id: society.id,
      name: society.name,
      cityId: society.cityId,
      localityName: society.localityName ?? null,
      address: society.address ?? null,
      latitude:
        society.latitude === null || society.latitude === undefined
          ? null
          : Number(society.latitude),
      longitude:
        society.longitude === null || society.longitude === undefined
          ? null
          : Number(society.longitude),
      pincode: society.pincode ?? null,
      isVerified: society.isVerified ?? false,
      createdByUserId: society.createdByUserId ?? null,
      createdAt: society.createdAt,
      updatedAt: society.updatedAt,
      city: citySummary,
    };
  }

  private async getCitySummaryForSociety(
    society: MasterSociety,
    cache: Map<string, CitySummary | null>,
  ): Promise<CitySummary | null> {
    if (society.city) {
      return this.toCitySummary(society.city as MasterCity);
    }

    if (!society.cityId) {
      return null;
    }

    if (cache.has(society.cityId)) {
      return cache.get(society.cityId) ?? null;
    }

    const city = await this.cityRepository.findById(society.cityId);
    const summary = this.toCitySummary(city);
    cache.set(society.cityId, summary);
    return summary;
  }

  private async ensureCityExists(cityId: string): Promise<MasterCity> {
    const city = await this.cityRepository.findById(cityId);
    if (!city) {
      throw new BadRequestException(`City with ID ${cityId} not found`);
    }
    return city;
  }

  private async ensureSocietyExists(
    societyId: string,
  ): Promise<MasterSociety> {
    const society = await this.societyRepository.findById(societyId);
    if (!society) {
      throw new BadRequestException(`Society with ID ${societyId} not found`);
    }
    return society;
  }

  private toBhkResponse(bhk: MasterBhkType): AdminBhkResponseDto {
    return {
      id: bhk.id,
      name: bhk.name,
      code: bhk.code,
      sortOrder: bhk.sortOrder,
      propertyTypeId: bhk.propertyTypeId,
      societyId: bhk.societyId ?? null,
      localityId: bhk.localityId ?? null,
      createdAt: bhk.createdAt,
      updatedAt: bhk.updatedAt,
    };
  }

  private async ensureBhkExists(bhkId: string): Promise<MasterBhkType> {
    const bhk = await this.bhkTypeRepository.findById(bhkId);
    if (!bhk) {
      throw new BadRequestException(`BHK type with ID ${bhkId} not found`);
    }
    return bhk;
  }

  private toLocalityResponse(
    locality: MasterLocality,
    citySummary: CitySummary | null,
  ): AdminLocalityResponseDto {
    return {
      id: locality.id,
      name: locality.name,
      sector: locality.sector ?? null,
      cityId: locality.cityId,
      latitude:
        locality.latitude === null || locality.latitude === undefined
          ? null
          : Number(locality.latitude),
      longitude:
        locality.longitude === null || locality.longitude === undefined
          ? null
          : Number(locality.longitude),
      createdAt: locality.createdAt,
      updatedAt: locality.updatedAt,
      city: citySummary,
    };
  }

  private async getCitySummaryForLocality(
    locality: MasterLocality,
    cache: Map<string, CitySummary | null>,
  ): Promise<CitySummary | null> {
    if (locality.city) {
      return this.toCitySummary(locality.city as MasterCity);
    }

    if (!locality.cityId) {
      return null;
    }

    if (cache.has(locality.cityId)) {
      return cache.get(locality.cityId) ?? null;
    }

    const city = await this.cityRepository.findById(locality.cityId);
    const summary = this.toCitySummary(city);
    cache.set(locality.cityId, summary);
    return summary;
  }

  private async ensureLocalityExists(
    localityId: string,
  ): Promise<MasterLocality> {
    const locality = await this.localityRepository.findById(localityId);
    if (!locality) {
      throw new BadRequestException(`Locality with ID ${localityId} not found`);
    }
    return locality;
  }

  private toChannelPartnerCodeResponse(
    code: ChannelPartnerCode,
  ): AdminChannelPartnerCodeResponseDto {
    return {
      id: code.id,
      code: code.code,
      createdAt: code.createdAt,
      updatedAt: code.updatedAt,
    };
  }

  private async ensureChannelPartnerCodeExists(
    codeId: string,
  ): Promise<ChannelPartnerCode> {
    const code = await this.channelPartnerCodeRepository.findById(codeId);
    if (!code) {
      throw new BadRequestException(
        `Channel partner code with ID ${codeId} not found`,
      );
    }
    return code;
  }

  private toOwnerResponse(user: User): AdminOwnerResponseDto {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isActive: user.isActive,
      isBlocked: user.isBlocked,
      phoneVerified: user.phoneVerified,
      intent: user.intent ?? null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  private toChannelPartnerResponse(
    user: User,
    isAgreementCompleted: boolean = false,
  ): AdminChannelPartnerResponseDto {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isActive: user.isActive,
      isBlocked: user.isBlocked,
      phoneVerified: user.phoneVerified,
      isAgreementCompleted,
      channelPartnerCode: user.channelPartnerCode,
      firmName: user.firmName,
      cities: user.cities,
      businessSince: user.businessSince,
      aboutYourSelf: user.aboutYourSelf,
      intent: user.intent ?? null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  // Furnishing management
  async listFurnishings(
    query: AdminFurnishingListQueryDto,
  ): Promise<{
    success: boolean;
    data: AdminFurnishingResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    const page = Math.max(1, query?.page || 1);
    const limit = Math.min(100, Math.max(1, query?.limit || 20));
    const search = query?.search?.trim();

    const { items, total } = await this.furnishingRepository.findPaginated({
      page,
      limit,
      search,
    });

    const data = items.map((furnishing) => this.toFurnishingResponse(furnishing));
    return {
      success: true,
      data,
      total,
      page,
      limit,
    };
  }

  async getFurnishing(
    furnishingId: string,
  ): Promise<{ success: boolean; data: AdminFurnishingResponseDto }> {
    const furnishing = await this.ensureFurnishingExists(furnishingId);
    return {
      success: true,
      data: this.toFurnishingResponse(furnishing),
    };
  }

  async createFurnishing(
    dto: AdminCreateFurnishingDto,
  ): Promise<{ success: boolean; data: AdminFurnishingResponseDto }> {
    // Normalize code (lowercase, replace spaces with hyphens)
    const normalizedCode = dto.code
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');

    // Check if code already exists
    const existing = await this.furnishingRepository.findByCode(normalizedCode);
    if (existing) {
      throw new BadRequestException(
        `Furnishing with code "${normalizedCode}" already exists`,
      );
    }

    const furnishing = await this.furnishingRepository.createFurnishing({
      name: dto.name.trim(),
      code: normalizedCode,
      icon: dto.icon?.trim() ?? null,
      sortOrder: dto.sortOrder ?? 0,
      isActive: dto.isActive ?? true,
    });

    return {
      success: true,
      data: this.toFurnishingResponse(furnishing),
    };
  }

  async updateFurnishing(
    furnishingId: string,
    dto: AdminUpdateFurnishingDto,
  ): Promise<{ success: boolean; data: AdminFurnishingResponseDto }> {
    const furnishing = await this.ensureFurnishingExists(furnishingId);

    // If code is being updated, normalize and check for duplicates
    let normalizedCode: string | undefined;
    if (dto.code) {
      normalizedCode = dto.code
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
      
      if (normalizedCode !== furnishing.code) {
        const existing = await this.furnishingRepository.findByCode(normalizedCode);
        if (existing && existing.id !== furnishingId) {
          throw new BadRequestException(
            `Furnishing with code "${normalizedCode}" already exists`,
          );
        }
      }
    }

    await this.furnishingRepository.updateFurnishing(furnishingId, {
      ...dto,
      name: dto.name?.trim() ?? dto.name,
      code: normalizedCode ?? dto.code,
      icon: dto.icon?.trim() ?? dto.icon,
    });

    const updated = await this.ensureFurnishingExists(furnishingId);
    return {
      success: true,
      data: this.toFurnishingResponse(updated),
    };
  }

  async deleteFurnishing(
    furnishingId: string,
  ): Promise<{ success: boolean; message: string; furnishingId: string }> {
    await this.ensureFurnishingExists(furnishingId);
    await this.furnishingRepository.deleteFurnishing(furnishingId);
    return {
      success: true,
      message: 'Furnishing deleted successfully',
      furnishingId,
    };
  }

  private async ensureFurnishingExists(
    furnishingId: string,
  ): Promise<MasterFurnishing> {
    const furnishing = await this.furnishingRepository.findById(furnishingId);
    if (!furnishing) {
      throw new BadRequestException(`Furnishing with ID "${furnishingId}" not found`);
    }
    return furnishing;
  }

  private toFurnishingResponse(
    furnishing: MasterFurnishing,
  ): AdminFurnishingResponseDto {
    return {
      id: furnishing.id,
      name: furnishing.name,
      code: furnishing.code,
      icon: furnishing.icon ?? null,
      sortOrder: furnishing.sortOrder,
      isActive: furnishing.isActive,
      createdAt: furnishing.createdAt,
      updatedAt: furnishing.updatedAt,
    };
  }

  // Amenity management
  async listAmenities(
    query: AdminAmenityListQueryDto,
  ): Promise<{
    success: boolean;
    data: AdminAmenityResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    const page = Math.max(1, query?.page || 1);
    const limit = Math.min(100, Math.max(1, query?.limit || 20));
    const search = query?.search?.trim();

    const { items, total } = await this.amenityRepository.findPaginated({
      page,
      limit,
      search,
    });

    const data = items.map((amenity) => this.toAmenityResponse(amenity));
    return {
      success: true,
      data,
      total,
      page,
      limit,
    };
  }

  async getAmenity(
    amenityId: string,
  ): Promise<{ success: boolean; data: AdminAmenityResponseDto }> {
    const amenity = await this.ensureAmenityExists(amenityId);
    return {
      success: true,
      data: this.toAmenityResponse(amenity),
    };
  }

  async createAmenity(
    dto: AdminCreateAmenityDto,
  ): Promise<{ success: boolean; data: AdminAmenityResponseDto }> {
    // Normalize code (lowercase, replace spaces with hyphens)
    const normalizedCode = dto.code
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');

    // Check if code already exists
    const existing = await this.amenityRepository.findByCode(normalizedCode);
    if (existing) {
      throw new BadRequestException(
        `Amenity with code "${normalizedCode}" already exists`,
      );
    }

    const amenity = await this.amenityRepository.createAmenity({
      name: dto.name.trim(),
      code: normalizedCode,
      icon: dto.icon?.trim() ?? null,
      sortOrder: dto.sortOrder ?? 0,
      isActive: dto.isActive ?? true,
    });

    return {
      success: true,
      data: this.toAmenityResponse(amenity),
    };
  }

  async updateAmenity(
    amenityId: string,
    dto: AdminUpdateAmenityDto,
  ): Promise<{ success: boolean; data: AdminAmenityResponseDto }> {
    const amenity = await this.ensureAmenityExists(amenityId);

    // If code is being updated, normalize and check for duplicates
    let normalizedCode: string | undefined;
    if (dto.code) {
      normalizedCode = dto.code
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
      
      if (normalizedCode !== amenity.code) {
        const existing = await this.amenityRepository.findByCode(normalizedCode);
        if (existing && existing.id !== amenityId) {
          throw new BadRequestException(
            `Amenity with code "${normalizedCode}" already exists`,
          );
        }
      }
    }

    await this.amenityRepository.updateAmenity(amenityId, {
      ...dto,
      name: dto.name?.trim() ?? dto.name,
      code: normalizedCode ?? dto.code,
      icon: dto.icon?.trim() ?? dto.icon,
    });

    const updated = await this.ensureAmenityExists(amenityId);
    return {
      success: true,
      data: this.toAmenityResponse(updated),
    };
  }

  async deleteAmenity(
    amenityId: string,
  ): Promise<{ success: boolean; message: string; amenityId: string }> {
    await this.ensureAmenityExists(amenityId);
    await this.amenityRepository.deleteAmenity(amenityId);
    return {
      success: true,
      message: 'Amenity deleted successfully',
      amenityId,
    };
  }

  private async ensureAmenityExists(
    amenityId: string,
  ): Promise<MasterAmenity> {
    const amenity = await this.amenityRepository.findById(amenityId);
    if (!amenity) {
      throw new BadRequestException(`Amenity with ID "${amenityId}" not found`);
    }
    return amenity;
  }

  private toAmenityResponse(
    amenity: MasterAmenity,
  ): AdminAmenityResponseDto {
    return {
      id: amenity.id,
      name: amenity.name,
      code: amenity.code,
      icon: amenity.icon ?? null,
      sortOrder: amenity.sortOrder,
      isActive: amenity.isActive,
      createdAt: amenity.createdAt,
      updatedAt: amenity.updatedAt,
    };
  }

  // User management methods
  async blockUser(userId: string): Promise<AdminBlockUserResponseDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new BadRequestException(`User with ID ${userId} not found`);
    }

    if (user.isBlocked) {
      throw new BadRequestException('User is already blocked');
    }

    await this.userRepository.update(userId, { isBlocked: true });

    return {
      success: true,
      message: 'User blocked successfully',
      userId,
      isBlocked: true,
    };
  }

  async unblockUser(userId: string): Promise<AdminUnblockUserResponseDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new BadRequestException(`User with ID ${userId} not found`);
    }

    if (!user.isBlocked) {
      throw new BadRequestException('User is not blocked');
    }

    await this.userRepository.update(userId, { isBlocked: false });

    return {
      success: true,
      message: 'User unblocked successfully',
      userId,
      isBlocked: false,
    };
  }

  async editUser(
    userId: string,
    dto: AdminEditUserDto,
  ): Promise<AdminEditUserResponseDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new BadRequestException(`User with ID ${userId} not found`);
    }

    // Check for email uniqueness if email is being updated
    if (dto.email && dto.email !== user.email) {
      const existingUser = await this.userRepository.findByEmail(dto.email);
      if (existingUser && existingUser.id !== userId) {
        throw new BadRequestException(
          `Email ${dto.email} is already in use by another user`,
        );
      }
    }

    const updateData: Partial<User> = {};

    if (dto.name !== undefined) {
      updateData.name = dto.name?.trim() || null;
    }
    if (dto.email !== undefined) {
      updateData.email = dto.email?.trim() || null;
    }
    if (dto.firmName !== undefined) {
      updateData.firmName = dto.firmName?.trim() || null;
    }
    if (dto.cities !== undefined) {
      updateData.cities = dto.cities?.trim() || null;
    }
    if (dto.businessSince !== undefined) {
      updateData.businessSince = dto.businessSince?.trim() || null;
    }
    if (dto.aboutYourSelf !== undefined) {
      updateData.aboutYourSelf = dto.aboutYourSelf?.trim() || null;
    }
    if (dto.isActive !== undefined) {
      updateData.isActive = dto.isActive;
    }
    if (dto.phoneVerified !== undefined) {
      updateData.phoneVerified = dto.phoneVerified;
    }

    if (Object.keys(updateData).length === 0) {
      throw new BadRequestException('No fields provided to update');
    }

    await this.userRepository.update(userId, updateData);

    // Fetch updated user
    const updatedUser = await this.userRepository.findById(userId);
    if (!updatedUser) {
      throw new BadRequestException(`User with ID ${userId} not found after update`);
    }

    // Get KYC status
    const kycStatus = await this.userService.getVerificationStepsStatus(userId);

    // Get bank details (decrypted)
    const bankDetails = await this.userService.getBankDetails(userId);

    return {
      success: true,
      message: 'User updated successfully',
      data: this.toUserDetailResponse(updatedUser, kycStatus, bankDetails),
    };
  }

  async getUserDetails(
    userId: string,
  ): Promise<{ success: boolean; data: AdminUserDetailResponseDto }> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new BadRequestException(`User with ID ${userId} not found`);
    }

    // Get KYC status
    const kycStatus = await this.userService.getVerificationStepsStatus(userId);

    // Get bank details (decrypted)
    const bankDetails = await this.userService.getBankDetails(userId);

    return {
      success: true,
      data: this.toUserDetailResponse(user, kycStatus, bankDetails),
    };
  }

  private toUserDetailResponse(
    user: User,
    kycStatus: any,
    bankDetails: any,
  ): AdminUserDetailResponseDto {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isActive: user.isActive,
      isBlocked: user.isBlocked,
      phoneVerified: user.phoneVerified,
      intent: user.intent ?? null,
      channelPartnerCode: user.channelPartnerCode ?? null,
      firmName: user.firmName ?? null,
      cities: user.cities ?? null,
      businessSince: user.businessSince ?? null,
      aboutYourSelf: user.aboutYourSelf ?? null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      kyc_completed: kycStatus.kyc_completed,
      kyc_status: {
        step1_live_photo: kycStatus.step1_live_photo,
        step2_aadhaar: kycStatus.step2_aadhaar,
        step3_bank_details: kycStatus.step3_bank_details,
        step4_docusign_agreement: kycStatus.step4_docusign_agreement,
      },
      live_photo_url: user.livePhotoUrl ?? null,
      aadhaar_number: user.aadhaarNumber ?? null,
      bank_details: bankDetails ?? null,
    };
  }

  /**
   * Approve or reject live photo for channel partner KYC
   */
  async approveLivePhoto(
    dto: AdminApproveLivePhotoDto,
    adminId: string,
  ): Promise<AdminApproveLivePhotoResponseDto> {
    const user = await this.userRepository.findById(dto.userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Verify user is a channel partner
    if (user.role !== UserRole.CHANNEL_PARTNER) {
      throw new BadRequestException('User is not a channel partner');
    }

    // Check if live photo exists
    if (!user.livePhotoUrl) {
      throw new BadRequestException('User has not uploaded a live photo');
    }

    // Update live photo approval status
    await this.userRepository.update(dto.userId, {
      livePhotoApproved: dto.approved,
    });

    // Check and update KYC status after approval
    const kycCompleted = await this.userService.checkAndUpdateKycStatus(dto.userId);

    return {
      success: true,
      message: dto.approved
        ? 'Live photo approved successfully'
        : 'Live photo approval rejected',
      userId: dto.userId,
      live_photo_approved: dto.approved,
      kyc_completed: kycCompleted,
    };
  }

  /**
   * Approve or reject KYC for channel partner
   * This sets the kycCompleted flag directly, overriding automatic checks
   */
  async approveKyc(
    dto: AdminApproveKycDto,
    adminId: string,
  ): Promise<AdminApproveKycResponseDto> {
    const user = await this.userRepository.findById(dto.userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Verify user is a channel partner
    if (user.role !== UserRole.CHANNEL_PARTNER) {
      throw new BadRequestException('User is not a channel partner');
    }

    // Update KYC completion status
    await this.userRepository.update(dto.userId, {
      kycCompleted: dto.approved,
    });

    // Get updated KYC status
    const kycStatus = await this.userService.getVerificationStepsStatus(dto.userId);

    return {
      success: true,
      message: dto.approved
        ? 'KYC approved successfully'
        : 'KYC approval rejected',
      userId: dto.userId,
      kyc_completed: dto.approved,
      kyc_status: {
        step1_live_photo: kycStatus.step1_live_photo,
        step2_aadhaar: kycStatus.step2_aadhaar,
        step3_bank_details: kycStatus.step3_bank_details,
        step4_docusign_agreement: kycStatus.step4_docusign_agreement,
      },
    };
  }
}

