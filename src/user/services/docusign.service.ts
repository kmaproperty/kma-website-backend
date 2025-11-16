import { Injectable, BadRequestException } from '@nestjs/common';
import axios from 'axios';
import { User } from '../entities/user.entity';
import { ChannelPartnerAgreementRepository } from '../repositories/channel-partner-agreement.repository';

interface DocusignConfig {
  baseUrl: string;
  accountId: string;
  accessToken: string;
  templateId: string;
}

@Injectable()
export class DocusignService {
  constructor(private readonly agreementRepository: ChannelPartnerAgreementRepository) {}
  private getConfig(): DocusignConfig {
    const baseUrl = process.env.DOCUSIGN_BASE_URL || 'https://demo.docusign.net/restapi';
    const accountId = process.env.DOCUSIGN_ACCOUNT_ID || '';
    const accessToken = process.env.DOCUSIGN_ACCESS_TOKEN || '';
    const templateId = process.env.DOCUSIGN_TEMPLATE_ID || '';
    if (!accountId || !accessToken || !templateId) {
      throw new BadRequestException(
        'DocuSign configuration missing. Please set DOCUSIGN_ACCOUNT_ID, DOCUSIGN_ACCESS_TOKEN, DOCUSIGN_TEMPLATE_ID',
      );
    }
    return { baseUrl, accountId, accessToken, templateId };
  }

  async createEmbeddedSigningEnvelope(params: {
    user: User;
    name: string;
    email: string;
    returnUrl: string;
  }): Promise<{ envelopeId: string; url: string }> {
    const { baseUrl, accountId, accessToken, templateId } = this.getConfig();
    const clientUserId = params.user.id;

    // 1. Create envelope from template with recipient as embedded signer
    const envelopeDefinition = {
      templateId,
      templateRoles: [
        {
          roleName: 'signer',
          name: params.name,
          email: params.email,
          clientUserId,
        },
      ],
      status: 'sent',
    };

    const createEnvelopeResp = await axios.post(
      `${baseUrl}/v2.1/accounts/${accountId}/envelopes`,
      envelopeDefinition,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      },
    );

    const envelopeId = createEnvelopeResp.data?.envelopeId as string;
    if (!envelopeId) {
      throw new BadRequestException('Failed to create DocuSign envelope');
    }

    // 2. Create recipient view (embedded signing URL)
    const recipientViewReq = {
      returnUrl: params.returnUrl,
      authenticationMethod: 'none',
      email: params.email,
      userName: params.name,
      clientUserId,
    };
    const viewResp = await axios.post(
      `${baseUrl}/v2.1/accounts/${accountId}/envelopes/${envelopeId}/views/recipient`,
      recipientViewReq,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      },
    );

    const url = viewResp.data?.url as string;
    if (!url) {
      throw new BadRequestException('Failed to create DocuSign recipient view');
    }

    // Save agreement record
    await this.agreementRepository.createAgreement({
      userId: params.user.id,
      envelopeId,
      status: 'sent',
      returnUrl: params.returnUrl,
    });

    return { envelopeId, url };
  }
}


