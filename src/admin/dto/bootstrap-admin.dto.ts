import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class BootstrapAdminDto {
  @ApiProperty({
    description: 'Admin username to bootstrap',
    example: 'superadmin',
  })
  @IsString()
  @MinLength(3)
  @MaxLength(150)
  username: string;

  @ApiProperty({
    description: 'Admin password to bootstrap',
    example: 'SuperSecurePassword123!',
  })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password: string;

  @ApiPropertyOptional({
    description:
      'Bootstrap secret for validation (must match ADMIN_BOOTSTRAP_SECRET if set)',
  })
  @IsString()
  @IsOptional()
  bootstrapSecret?: string;
}

export class BootstrapAdminResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({
    example: 'Admin credentials created successfully',
  })
  message: string;
}

