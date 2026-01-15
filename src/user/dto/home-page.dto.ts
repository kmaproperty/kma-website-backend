import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AboutUsDataDto {
  @ApiProperty({
    description: 'About Us heading',
    example: 'About KMA',
  })
  heading: string;

  @ApiProperty({
    description: 'About Us description',
    example: 'KMA is a leading real estate platform...',
  })
  description: string;
}

export class HomePageStatisticsDto {
  @ApiProperty({
    description: 'Total number of owners',
    example: 1250,
  })
  totalOwners: number;

  @ApiProperty({
    description: 'Total number of channel partners',
    example: 350,
  })
  totalChannelPartners: number;

  @ApiProperty({
    description: 'Total number of users/clients',
    example: 5000,
  })
  totalUsers: number;

  @ApiProperty({
    description: 'Total number of active properties',
    example: 8500,
  })
  totalActiveProperties: number;

  @ApiProperty({
    description: 'Properties listed in last 24 hours',
    example: 25,
  })
  propertiesListedLast24Hours: number;
}

export class HomePageResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({
    description: 'About Us data',
    type: AboutUsDataDto,
    required: false,
  })
  aboutUs?: AboutUsDataDto | null;

  @ApiProperty({
    description: 'Home page statistics',
    type: HomePageStatisticsDto,
  })
  statistics: HomePageStatisticsDto;
}

