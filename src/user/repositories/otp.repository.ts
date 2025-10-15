import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Otp } from '../entities/otp.entity';

@Injectable()
export class OtpRepository {
  constructor(
    @InjectRepository(Otp)
    private readonly otpRepository: Repository<Otp>,
  ) {}

  /**
   * Create a new OTP record
   */
  async create(otpData: Partial<Otp>): Promise<Otp> {
    const otp = this.otpRepository.create(otpData);
    return await this.otpRepository.save(otp);
  }

  /**
   * Find active OTP by phone number
   */
  async findActiveByPhone(phone: string): Promise<Otp | null> {
    return await this.otpRepository.findOne({
      where: {
        phone,
        isUsed: false,
      },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Find latest OTP by phone number (regardless of status)
   */
  async findLatestByPhone(phone: string): Promise<Otp | null> {
    return await this.otpRepository.findOne({
      where: { phone },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Mark OTP as used
   */
  async markAsUsed(id: string): Promise<void> {
    await this.otpRepository.update(id, { isUsed: true });
  }

  /**
   * Increment attempts for OTP
   */
  async incrementAttempts(id: string): Promise<void> {
    await this.otpRepository.increment({ id }, 'attempts', 1);
  }

  /**
   * Delete expired OTPs
   */
  async deleteExpired(): Promise<void> {
    await this.otpRepository.delete({
      expiresAt: LessThan(new Date()),
    });
  }

  /**
   * Delete all OTPs for a phone number
   */
  async deleteByPhone(phone: string): Promise<void> {
    await this.otpRepository.delete({ phone });
  }
}
