import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import twilio from 'twilio';

@Injectable()
export class TwilioSmsService {
  private readonly logger = new Logger(TwilioSmsService.name);
  private client: ReturnType<typeof twilio> | null = null;
  private readonly fromNumber: string;

  constructor(private readonly configService: ConfigService) {
    const accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
    const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');
    this.fromNumber = this.configService.get<string>('TWILIO_PHONE_NUMBER') || '';

    if (accountSid && authToken && this.fromNumber) {
      this.client = twilio(accountSid, authToken);
      this.logger.log('Twilio SMS service configured successfully');
    } else {
      this.logger.warn(
        'Twilio SMS is not fully configured. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER.',
      );
    }
  }

  private isConfigured(): boolean {
    return !!(this.client && this.fromNumber);
  }

  private normalizePhoneNumber(rawPhone: string): string | null {
    if (!rawPhone) return null;
    const digits = rawPhone.replace(/\D/g, '');
    if (digits.length === 10) return `+91${digits}`;
    if (digits.length > 10 && !digits.startsWith('+')) return `+${digits}`;
    return digits.length >= 10 ? `+${digits}` : null;
  }

  async sendOtp(
    phone: string,
    otpCode: string,
    expiryMinutes: number = 10,
  ): Promise<void> {
    if (!this.isConfigured()) {
      this.logger.warn('Twilio SMS not configured. Skipping OTP send.');
      return;
    }

    const to = this.normalizePhoneNumber(phone);
    if (!to) {
      this.logger.warn(`Invalid phone format: ${phone}`);
      return;
    }

    try {
      await this.client!.messages.create({
        body: `Your KMA verification code is ${otpCode}. Valid for ${expiryMinutes} minutes. Do not share this code.`,
        from: this.fromNumber,
        to,
      });

      this.logger.log(`SMS OTP sent successfully to ${to}`);
    } catch (error: any) {
      this.logger.error(`Failed to send SMS OTP to ${to}: ${error?.message}`);
    }
  }
}
