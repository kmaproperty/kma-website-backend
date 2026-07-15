import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * SmartPing DLT SMS gateway. Sends OTPs over the registered KMAPRP sender
 * using the approved DLT template:
 *
 *   "Dear User, your OTP is {var1} for account verifcation on KMA Property.
 *    - KMA GLOBAL PROPERTIES"
 *
 * Reads the gateway credentials and DLT identifiers from env vars so they
 * never live in source. If the env vars are not set the service no-ops with
 * a warning — matching the Twilio service behaviour, so OTP send paths stay
 * resilient when one provider is misconfigured.
 */
@Injectable()
export class SmartpingSmsService {
  private readonly logger = new Logger(SmartpingSmsService.name);

  private readonly endpoint: string;
  private readonly username: string;
  private readonly password: string;
  private readonly senderId: string;
  private readonly dltPrincipalEntityId: string;
  private readonly dltContentId: string;

  // constructor(private readonly configService: ConfigService) {
  //   this.endpoint =
  //     this.configService.get<string>('SMARTPING_ENDPOINT') ||
  //     'https://pgapi.smartping.io/fe/api/v1/send';
  //   this.username = this.configService.get<string>('SMARTPING_USERNAME') || '';
  //   this.password = this.configService.get<string>('SMARTPING_PASSWORD') || '';
  //   this.senderId = this.configService.get<string>('SMARTPING_SENDER_ID') || 'KMAPRP';
  //   this.dltPrincipalEntityId =
  //     this.configService.get<string>('SMARTPING_DLT_PRINCIPAL_ENTITY_ID') || '';
  //   this.dltContentId = this.configService.get<string>('SMARTPING_DLT_CONTENT_ID') || '';

  //   if (this.isConfigured()) {
  //     this.logger.log('SmartPing SMS service configured');
  //   } else {
  //     this.logger.warn(
  //       'SmartPing not fully configured. Set SMARTPING_USERNAME, SMARTPING_PASSWORD, SMARTPING_DLT_PRINCIPAL_ENTITY_ID, SMARTPING_DLT_CONTENT_ID.',
  //     );
  //   }
  // }

    constructor(private readonly configService: ConfigService) {
    this.endpoint =
      this.configService.get<string>('SMARTPING_ENDPOINT') ||
      'https://pgapi.smartping.io/fe/api/v1/send';
    this.username = this.configService.get<string>('SMARTPING_USERNAME') || '';
    this.password = this.configService.get<string>('SMARTPING_PASSWORD') || '';
    // this.senderId = this.configService.get<string>('SMARTPING_SENDER_ID') || 'KMAPRP';
    this.senderId = 'KMAGLP';
    // this.dltPrincipalEntityId =
    //   this.configService.get<string>('SMARTPING_DLT_PRINCIPAL_ENTITY_ID') || '';
    this.dltPrincipalEntityId = '1077374780002274374';
    // this.dltContentId = this.configService.get<string>('SMARTPING_DLT_CONTENT_ID') || '';
    this.dltContentId = '1547909';

    if (this.isConfigured()) {
      this.logger.log('SmartPing SMS service configured');
    } else {
      this.logger.warn(
        'SmartPing not fully configured. Set SMARTPING_USERNAME, SMARTPING_PASSWORD, SMARTPING_DLT_PRINCIPAL_ENTITY_ID, SMARTPING_DLT_CONTENT_ID.',
      );
    }
  }

  private isConfigured(): boolean {
    return (
      !!this.username &&
      !!this.password &&
      !!this.dltPrincipalEntityId &&
      !!this.dltContentId
    );
  }

  private normalizePhoneNumber(rawPhone: string): string | null {
    if (!rawPhone) return null;
    const digits = rawPhone.replace(/\D/g, '');
    // SmartPing expects raw digits with country code (no plus). 10 digits → assume IN.
    if (digits.length === 10) return `91${digits}`;
    if (digits.length >= 10) return digits;
    return null;
  }

  async sendOtp(
    phone: string,
    otpCode: string,
    _expiryMinutes: number = 10,
  ): Promise<void> {
    if (!this.isConfigured()) {
      this.logger.warn('SmartPing not configured. Skipping OTP send.');
      return;
    }

    const to = this.normalizePhoneNumber(phone);
    if (!to) {
      this.logger.warn(`Invalid phone format for SmartPing: ${phone}`);
      return;
    }

    // DLT-approved template body. The {var1} placeholder must be replaced
    // with the literal OTP — DLT signature is computed on the resolved text.
    // const text = `Dear User, your OTP is ${otpCode} for account verifcation on KMA Property. - KMA GLOBAL PROPERTIES`;
    const text = `Dear User, your OTP is ${otpCode}. Verify your account at https://kmaglobalproperty.com. Do not share this OTP. - KMA GLOBAL PROPERTIES`;

    const params = new URLSearchParams({
      username: this.username,
      password: this.password,
      unicode: 'false',
      from: this.senderId,
      to,
      dltPrincipalEntityId: this.dltPrincipalEntityId,
      dltContentId: this.dltContentId,
      text,
    });

    const url = `${this.endpoint}?${params.toString()}`;

    try {
      const res = await fetch(url, { method: 'GET' });
      const body = await res.text();
      if (!res.ok) {
        this.logger.error(
          `SmartPing OTP send to ${to} failed: HTTP ${res.status} body=${body}`,
        );
        return;
      }
      this.logger.log(`SmartPing OTP sent to ${to} (HTTP ${res.status}): ${body.slice(0, 200)}`);
    } catch (error: any) {
      this.logger.error(
        `SmartPing OTP send to ${to} threw: ${error?.message ?? String(error)}`,
      );
    }
  }
}
