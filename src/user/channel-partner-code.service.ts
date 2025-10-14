import { Injectable, BadRequestException } from '@nestjs/common';
import { ChannelPartnerCodeRepository } from './repositories/channel-partner-code.repository';
import {
  CreateChannelPartnerCodeDto,
  CreateChannelPartnerCodeResponseDto,
  ListChannelPartnerCodesResponseDto,
} from './dto';

@Injectable()
export class ChannelPartnerCodeService {
  constructor(
    private readonly channelPartnerCodeRepository: ChannelPartnerCodeRepository,
  ) {}

  async createChannelPartnerCode(
    createDto: CreateChannelPartnerCodeDto,
  ): Promise<CreateChannelPartnerCodeResponseDto> {
    const { code } = createDto;

    // Check if code already exists
    const existingCode =
      await this.channelPartnerCodeRepository.findByCode(code);
    if (existingCode) {
      throw new BadRequestException(
        'Channel partner code already exists. Please use a different code.',
      );
    }

    // Create new channel partner code
    const newCode = await this.channelPartnerCodeRepository.create({ code });

    return {
      success: true,
      message: 'Channel partner code created successfully',
      data: {
        id: newCode.id,
        code: newCode.code,
        createdAt: newCode.createdAt,
      },
    };
  }

  async listChannelPartnerCodes(): Promise<ListChannelPartnerCodesResponseDto> {
    const codes = await this.channelPartnerCodeRepository.findAll();

    return {
      success: true,
      message: 'Channel partner codes retrieved successfully',
      data: codes.map((code) => ({
        id: code.id,
        code: code.code,
        createdAt: code.createdAt,
      })),
    };
  }

  async deleteChannelPartnerCode(
    id: string,
  ): Promise<{ success: boolean; message: string }> {
    const deleted = await this.channelPartnerCodeRepository.delete(id);

    if (!deleted) {
      throw new BadRequestException('Channel partner code not found');
    }

    return {
      success: true,
      message: 'Channel partner code deleted successfully',
    };
  }
}
