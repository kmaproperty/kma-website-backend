import { ApiProperty } from '@nestjs/swagger';

class PropertyStatsDto {
  @ApiProperty({ example: 500 })
  forRent: number;

  @ApiProperty({ example: 800 })
  forSale: number;

  @ApiProperty({ example: 1000 })
  active: number;

  @ApiProperty({ example: 200 })
  pending: number;

  @ApiProperty({ example: 900 })
  verified: number;
}

class UserStatsDto {
  @ApiProperty({ example: 2000 })
  total: number;

  @ApiProperty({ example: 1800 })
  active: number;

  @ApiProperty({ example: 200 })
  pending: number;

  @ApiProperty({ example: 1500 })
  verified: number;
}

class ChannelPartnerStatsDto {
  @ApiProperty({ example: 2000 })
  total: number;

  @ApiProperty({ example: 1800 })
  active: number;

  @ApiProperty({ example: 1500 })
  verified: number;

  @ApiProperty({ example: 1200 })
  kycCompleted: number;
}

export class AdminDashboardStatsResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ type: PropertyStatsDto })
  properties: PropertyStatsDto;

  @ApiProperty({ type: ChannelPartnerStatsDto })
  channelPartners: ChannelPartnerStatsDto;

  @ApiProperty({ type: UserStatsDto })
  owners: UserStatsDto;

  @ApiProperty({ type: UserStatsDto })
  customers: UserStatsDto;
}

class ChartDataPointDto {
  @ApiProperty({ example: 'Jan' })
  category: string;

  @ApiProperty({ example: 10 })
  value: number;
}

class ChartSeriesDto {
  @ApiProperty({ type: [ChartDataPointDto] })
  monthly: ChartDataPointDto[];

  @ApiProperty({ type: [ChartDataPointDto] })
  weekly: ChartDataPointDto[];
}

export class AdminDashboardChartsResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ type: ChartSeriesDto })
  properties: ChartSeriesDto;

  @ApiProperty({ type: ChartSeriesDto })
  channelPartners: ChartSeriesDto;

  @ApiProperty({ type: ChartSeriesDto })
  owners: ChartSeriesDto;

  @ApiProperty({ type: ChartSeriesDto })
  customers: ChartSeriesDto;
}
