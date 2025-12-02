import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsOptional, IsString, Length, ArrayUnique } from 'class-validator';
import { AdminRole } from '../enum/admin-role.enum';
import { AdminPermission } from '../enum/admin-permission.enum';

export class AdminUserListQueryDto {
  @ApiProperty({ required: false, example: 1 })
  @IsOptional()
  page?: number;

  @ApiProperty({ required: false, example: 20 })
  @IsOptional()
  limit?: number;
}

export class CreateAdminUserDto {
  @ApiProperty({ example: 'john_doe' })
  @IsString()
  @Length(3, 150)
  username: string;

  @ApiProperty({ example: 'S3cureP@ssw0rd' })
  @IsString()
  @Length(6, 100)
  password: string;

  @ApiProperty({ enum: AdminRole, required: false, default: AdminRole.ADMIN })
  @IsOptional()
  @IsEnum(AdminRole)
  role?: AdminRole;

  @ApiProperty({ enum: AdminPermission, isArray: true, required: false })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsEnum(AdminPermission, { each: true })
  permissions?: AdminPermission[];
}

export class UpdateAdminPermissionsDto {
  @ApiProperty({ enum: AdminPermission, isArray: true })
  @IsArray()
  @ArrayUnique()
  @IsEnum(AdminPermission, { each: true })
  permissions: AdminPermission[];
}

export class AdminUserResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  username: string;

  @ApiProperty({ enum: AdminRole })
  role: AdminRole;

  @ApiProperty({ enum: AdminPermission, isArray: true })
  permissions: AdminPermission[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({ required: false })
  updatedAt?: Date;
}

export class AdminUserListResponseDto {
  @ApiProperty({ type: AdminUserResponseDto, isArray: true })
  items: AdminUserResponseDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;
}

export class AdminPermissionsResponseDto {
  @ApiProperty({ enum: AdminPermission, isArray: true, description: 'List of all available admin permissions' })
  permissions: AdminPermission[];

  @ApiProperty({ description: 'Total number of permissions' })
  total: number;
}


