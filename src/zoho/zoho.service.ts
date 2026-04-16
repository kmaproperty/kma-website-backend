import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface ZohoCrmPayload {
  customer: Record<string, unknown>;
  property: Record<string, unknown> & { website_property_id?: string };
}

export interface ZohoSyncResult {
  success: boolean;
  status: number;
  error?: string;
}

@Injectable()
export class ZohoService {
  private readonly logger = new Logger(ZohoService.name);

  constructor(private readonly configService: ConfigService) {}

  async forwardToFlow(payload: ZohoCrmPayload): Promise<ZohoSyncResult> {
    const baseUrl = this.configService.get<string>('ZOHO_FLOW_WEBHOOK_URL');
    const apiKey = this.configService.get<string>('ZOHO_FLOW_API_KEY');

    if (!baseUrl || !apiKey) {
      this.logger.error('ZOHO_FLOW_WEBHOOK_URL or ZOHO_FLOW_API_KEY missing in env');
      return { success: false, status: 0, error: 'Zoho credentials not configured' };
    }

    const url = `${baseUrl}?zapikey=${apiKey}&isdebug=false`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        return { success: true, status: response.status };
      }

      const body = await response.text().catch(() => '');
      this.logger.warn(
        `Zoho webhook non-2xx: status=${response.status} body=${body.slice(0, 200)}`,
      );
      return { success: false, status: response.status, error: body.slice(0, 200) };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(`Zoho webhook call threw: ${message}`);
      return { success: false, status: 0, error: message };
    }
  }
}
