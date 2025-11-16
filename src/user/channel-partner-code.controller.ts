import { Controller, Post, Get, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { ChannelPartnerCodeService } from './channel-partner-code.service';
import {
  CreateChannelPartnerCodeDto,
  CreateChannelPartnerCodeResponseDto,
  ListChannelPartnerCodesResponseDto,
  ValidateChannelPartnerCodeQueryDto,
  ValidateChannelPartnerCodeResponseDto,
} from './dto';

@ApiTags('Channel Partner Code Management')
@Controller('channel-partner-codes')
export class ChannelPartnerCodeController {
  constructor(
    private readonly channelPartnerCodeService: ChannelPartnerCodeService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new channel partner code' })
  @ApiResponse({
    status: 201,
    description: 'Channel partner code created successfully',
    type: CreateChannelPartnerCodeResponseDto,
  })
  async createChannelPartnerCode(
    @Body() createDto: CreateChannelPartnerCodeDto,
  ): Promise<CreateChannelPartnerCodeResponseDto> {
    return await this.channelPartnerCodeService.createChannelPartnerCode(
      createDto,
    );
  }

  @Get()
  @ApiOperation({ summary: 'List all channel partner codes' })
  @ApiResponse({
    status: 200,
    description: 'Channel partner codes retrieved successfully',
    type: ListChannelPartnerCodesResponseDto,
  })
  async listChannelPartnerCodes(): Promise<ListChannelPartnerCodesResponseDto> {
    return await this.channelPartnerCodeService.listChannelPartnerCodes();
  }

  @Get('validate')
  @ApiOperation({ summary: 'Validate a channel partner code' })
  @ApiQuery({ name: 'code', required: true, description: 'Channel partner code to validate', example: 'CP001' })
  @ApiResponse({
    status: 200,
    description: 'Validation result',
    type: ValidateChannelPartnerCodeResponseDto,
  })
  async validateChannelPartnerCode(
    @Query() query: ValidateChannelPartnerCodeQueryDto,
  ): Promise<ValidateChannelPartnerCodeResponseDto> {
    const result = await this.channelPartnerCodeService.validateChannelPartnerCode(
      query.code,
    );
    return result;
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a channel partner code' })
  @ApiResponse({
    status: 200,
    description: 'Channel partner code deleted successfully',
  })
  async deleteChannelPartnerCode(
    @Param('id') id: string,
  ): Promise<{ success: boolean; message: string }> {
    return await this.channelPartnerCodeService.deleteChannelPartnerCode(id);
  }
}
