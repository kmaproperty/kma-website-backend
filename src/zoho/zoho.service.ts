import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface ZohoCrmPayload {
  customer: Record<string, unknown>;
  property: Record<string, unknown> & { website_property_id?: string };
}

export interface ZohoAccountPayload {
  user: Record<string, unknown>;
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

  async forwardToFlow(payload: ZohoCrmPayload, ownerRole?: string): Promise<ZohoSyncResult> {
    // Route to different Zoho webhooks based on property owner's role
    let baseUrl: string | undefined;
    let apiKey: string | undefined;

    if (ownerRole === 'OWNER') {
      baseUrl = this.configService.get<string>('ZOHO_FLOW_OWNER_WEBHOOK_URL') || this.configService.get<string>('ZOHO_FLOW_WEBHOOK_URL');
      apiKey = this.configService.get<string>('ZOHO_FLOW_OWNER_API_KEY') || this.configService.get<string>('ZOHO_FLOW_API_KEY');
    } else {
      baseUrl = this.configService.get<string>('ZOHO_FLOW_WEBHOOK_URL');
      apiKey = this.configService.get<string>('ZOHO_FLOW_API_KEY');
    }

    return this.post(baseUrl, apiKey, payload, `property/${ownerRole || 'CP'}`);
  }

  /**
   * Account-creation webhook. Fired when a new CP or Owner finishes filling
   * their profile. Routes to different Zoho Flow webhooks per role.
   */
  async forwardAccountToFlow(
    payload: ZohoAccountPayload,
    role: 'CHANNEL_PARTNER' | 'OWNER',
  ): Promise<ZohoSyncResult> {
    const isOwner = role === 'OWNER';
    const baseUrl =
      this.configService.get<string>(
        isOwner ? 'ZOHO_FLOW_OWNER_ACCOUNT_WEBHOOK_URL' : 'ZOHO_FLOW_CP_ACCOUNT_WEBHOOK_URL',
      ) ||
      this.configService.get<string>(
        isOwner ? 'ZOHO_FLOW_OWNER_WEBHOOK_URL' : 'ZOHO_FLOW_WEBHOOK_URL',
      );
    const apiKey = this.configService.get<string>(
      isOwner ? 'ZOHO_FLOW_OWNER_ACCOUNT_API_KEY' : 'ZOHO_FLOW_CP_ACCOUNT_API_KEY',
    );

    return this.post(baseUrl, apiKey, payload, `account/${role}`);
  }

  private async post(
    baseUrl: string | undefined,
    apiKey: string | undefined,
    payload: unknown,
    label: string,
  ): Promise<ZohoSyncResult> {
    if (!baseUrl || !apiKey) {
      this.logger.error(`Zoho webhook URL or API key missing in env (${label})`);
      return { success: false, status: 0, error: 'Zoho credentials not configured' };
    }

    const url = `${baseUrl}?zapikey=${apiKey}&isdebug=false`;
    this.logger.log(`Zoho sync: ${label}, url=${baseUrl.slice(-20)}`);

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
        `Zoho webhook non-2xx (${label}): status=${response.status} body=${body.slice(0, 200)}`,
      );
      return { success: false, status: response.status, error: body.slice(0, 200) };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(`Zoho webhook call threw (${label}): ${message}`);
      return { success: false, status: 0, error: message };
    }
  }
}
