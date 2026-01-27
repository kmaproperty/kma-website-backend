import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PropertyVerificationStatus } from '../../property/entities/property-verification-request.entity';

export class EndUserPropertyDetailsResponseDto {
  @ApiProperty({ description: 'Success status', example: true })
  success: boolean;

  @ApiProperty({
    description:
      'Full property entity object with all scalar fields and loaded relations (including photos, videos, and master data mappings).',
  })
  property: any;

  @ApiPropertyOptional({
    description: 'Verification status of the property from property verification request',
    enum: PropertyVerificationStatus,
    example: PropertyVerificationStatus.APPROVED,
    nullable: true,
  })
  verificationStatus?: PropertyVerificationStatus | null;

  @ApiPropertyOptional({
    description: 'Comments/rejection reason from property verification request',
    example: 'Property verified and approved',
    nullable: true,
  })
  comments?: string | null;

  @ApiPropertyOptional({
    description:
      'Remaining free views for unauthenticated users (-1 for unlimited for authenticated users)',
    example: 2,
  })
  remainingViews?: number;

  @ApiPropertyOptional({
    description:
      'Session ID for non-logged-in users (store this and send in X-Session-Id header for subsequent requests)',
    example: 'abc123def456',
  })
  sessionId?: string;
}

