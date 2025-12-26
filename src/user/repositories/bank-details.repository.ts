import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BankDetails } from '../entities/bank-details.entity';

@Injectable()
export class BankDetailsRepository {
  constructor(
    @InjectRepository(BankDetails)
    private readonly bankDetailsRepository: Repository<BankDetails>,
  ) {}

  /**
   * Create or update bank details for a user
   */
  async upsertBankDetails(
    userId: string,
    bankDetailsData: {
      accountNumber: string; // Encrypted
      ifscCode: string; // Encrypted
      bankName: string;
      accountHolderName: string;
      branchName?: string | null;
    },
  ): Promise<BankDetails> {
    // Check if bank details already exist for this user
    const existing = await this.bankDetailsRepository.findOne({
      where: { userId },
    });

    if (existing) {
      // Update existing
      Object.assign(existing, bankDetailsData);
      return await this.bankDetailsRepository.save(existing);
    } else {
      // Create new
      const bankDetails = this.bankDetailsRepository.create({
        userId,
        ...bankDetailsData,
      });
      return await this.bankDetailsRepository.save(bankDetails);
    }
  }

  /**
   * Find bank details by user ID
   */
  async findByUserId(userId: string): Promise<BankDetails | null> {
    return await this.bankDetailsRepository.findOne({
      where: { userId },
    });
  }

  /**
   * Delete bank details by user ID
   */
  async deleteByUserId(userId: string): Promise<boolean> {
    const result = await this.bankDetailsRepository.delete({ userId });
    return (result.affected || 0) > 0;
  }
}

