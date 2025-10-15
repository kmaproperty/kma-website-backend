import { Controller, Post, Get, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ChannelPartnerCodeService } from './channel-partner-code.service';
import {
  CreateChannelPartnerCodeDto,
  CreateChannelPartnerCodeResponseDto,
  ListChannelPartnerCodesResponseDto,
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
