import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '../config/config.service';

@Injectable()
export class MetaWhatsappService {
  private readonly logger = new Logger(MetaWhatsappService.name);
  private readonly accessToken: string;
  private readonly phoneNumberId: string;
  private readonly otpTemplateName: string;
  private readonly otpTemplateLanguage: string;

  constructor(private readonly configService: ConfigService) {
    this.accessToken = this.configService.getMetaWhatsAppAccessToken();
    this.phoneNumberId = this.configService.getMetaWhatsAppPhoneNumberId();
    this.otpTemplateName = this.configService.getMetaWhatsAppOtpTemplateName();
    this.otpTemplateLanguage =
      this.configService.getMetaWhatsAppOtpTemplateLanguage();

    if (!this.accessToken || !this.phoneNumberId) {
      this.logger.warn(
        'Meta WhatsApp Cloud API is not fully configured. OTP messages will not be sent via WhatsApp.',
      );
    }
  }

  /**
   * Normalize phone number to the format expected by WhatsApp Cloud API
   * (digits only, including country code).
   */
  private normalizePhoneNumber(rawPhone: string): string | null {
    if (!rawPhone) return null;
    // Remove all non-digit characters (including +, spaces, dashes)
    const digits = rawPhone.replace(/\D/g, '');
    return digits.length >= 10 ? digits : null;
  }

  private isConfigured(): boolean {
    return !!(
      this.accessToken &&
      this.phoneNumberId &&
      this.otpTemplateName &&
      this.otpTemplateLanguage
    );
  }

  /**
   * Send OTP via WhatsApp using Meta Cloud API template.
   * Assumes the template has at least two body parameters:
   * 1) OTP code
   * 2) Expiry in minutes
   */
  async sendOtp(
    phone: string,
    otpCode: string,
    expiryMinutes: number = 10,
  ): Promise<void> {
    if (!this.isConfigured()) {
      this.logger.warn(
        'Meta WhatsApp Cloud API is not configured. Skipping WhatsApp OTP send.',
      );
      return;
    }

    const to = this.normalizePhoneNumber(phone);
    if (!to) {
      this.logger.warn(
        `Cannot send WhatsApp OTP. Invalid phone format received: ${phone}`,
      );
      return;
    }

    const url = `https://graph.facebook.com/v21.0/${this.phoneNumberId}/messages`;

    const payload = {
      messaging_product: 'whatsapp',
      to,
      type: 'template',
      template: {
        name: this.otpTemplateName,
        language: {
          code: this.otpTemplateLanguage,
        },
        components: [
          {
            type: 'body',
            parameters: [
              {
                type: 'text',
                text: otpCode,
              },
              {
                type: 'text',
                text: String(expiryMinutes),
              },
            ],
          },
        ],
      },
    };

    try {
      await axios.post(url, payload, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      this.logger.log(
        `WhatsApp OTP message sent successfully to ${to} using template ${this.otpTemplateName}`,
      );
    } catch (error: any) {
      this.logger.error(
        `Failed to send WhatsApp OTP to ${to}: ${error?.message || error}`,
      );
      if (axios.isAxiosError(error)) {
        const data = error.response?.data;
        if (data) {
          this.logger.error(
            `Meta WhatsApp API error response: ${JSON.stringify(data)}`,
          );
        }
      }
      // Do not throw here to avoid breaking OTP generation/storage;
      // callers can still decide whether to surface failure to clients.
    }
  }
}

