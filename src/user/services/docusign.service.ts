import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import * as docusign from 'docusign-esign';
import { ChannelPartnerAgreementRepository } from '../repositories/channel-partner-agreement.repository';
import { ChannelPartnerAgreement, AgreementStatus } from '../entities/channel-partner-agreement.entity';
import { UserRepository } from '../repositories/user.repository';
import { UserRole } from '../enum/user-role.enum';

type AgreementRole = UserRole.OWNER | UserRole.CHANNEL_PARTNER;

@Injectable()
export class DocuSignService {
  private readonly logger = new Logger(DocuSignService.name);
  private apiClient: docusign.ApiClient;
  private accountId: string;
  private basePath: string;
  private accessToken: string | null = null;
  private tokenExpiresAt: Date | null = null;
  private isAuthenticating: Promise<void> | null = null;

  constructor(
    private readonly configService: ConfigService,
    private readonly agreementRepository: ChannelPartnerAgreementRepository,
    private readonly userRepository: UserRepository,
  ) {
    this.initializeApiClient();
  }

  /**
   * Load the agreement PDF for the given role as base64.
   * Owner role  → DOCUSIGN_OWNER_AGREEMENT_PATH (defaults to Owner_Agreement.pdf)
   * CP role     → DOCUSIGN_CHANNEL_PARTNER_AGREEMENT_PATH (defaults to Channel_Partner_Agreement.pdf)
   */
  private getAgreementDocument(
    role: AgreementRole = UserRole.CHANNEL_PARTNER,
  ): {
    documentBase64: string;
    documentName: string;
  } {
    const isOwner = role === UserRole.OWNER;
    const envKey = isOwner
      ? 'DOCUSIGN_OWNER_AGREEMENT_PATH'
      : 'DOCUSIGN_CHANNEL_PARTNER_AGREEMENT_PATH';
    const defaultFile = isOwner
      ? 'Owner_Agreement.pdf'
      : 'Channel_Partner_Agreement.pdf';
    const configuredPath = this.configService.get<string>(envKey);
    this.logger.log(`[${role}] Configured path: ${configuredPath || 'not set'}`);

    // Get project root
    const projectRoot = process.cwd();
    this.logger.log(`Project root (process.cwd()): ${projectRoot}`);

    // Try multiple possible paths
    const possiblePaths: string[] = [];

    if (configuredPath) {
      if (path.isAbsolute(configuredPath)) {
        // If it's an absolute path, try it first
        possiblePaths.push(configuredPath);
        
        // Also check if it's a "simple" absolute path like "/filename.pdf"
        // which might be a misconfiguration - try it as relative too
        const pathParts = configuredPath.split(path.sep).filter(p => p);
        if (pathParts.length === 1) {
          // Looks like "/filename.pdf" - probably meant to be relative
          this.logger.warn(`Absolute path "${configuredPath}" looks like it might be misconfigured. Also trying as relative path.`);
          possiblePaths.push(path.join(projectRoot, pathParts[0]));
        }
      } else {
        // If it's relative, try from project root
        possiblePaths.push(path.join(projectRoot, configuredPath));
      }
    } else {
      // Default: <role-specific filename> in project root
      possiblePaths.push(path.join(projectRoot, defaultFile));
    }

    // Try to find the file
    let absolutePath: string | null = null;
    for (const tryPath of possiblePaths) {
      this.logger.log(`Trying path: ${tryPath}`);
      if (fs.existsSync(tryPath)) {
        absolutePath = tryPath;
        break;
      }
    }

    if (!absolutePath) {
      const errorMessage = `${role} Agreement file not found. Tried paths: ${possiblePaths.join(', ')}. ` +
        `Please ensure ${envKey} is set correctly or place the file at: ${path.join(projectRoot, defaultFile)}`;
      this.logger.error(errorMessage);
      throw new BadRequestException(errorMessage);
    }

    this.logger.log(`Found document at: ${absolutePath}`);

    const fileBuffer = fs.readFileSync(absolutePath);
    const documentBase64 = fileBuffer.toString('base64');
    const documentName = path.basename(absolutePath);

    return { documentBase64, documentName };
  }

  private initializeApiClient() {
    const integratorKey = this.configService.get<string>('DOCUSIGN_INTEGRATOR_KEY');
    const userId = this.configService.get<string>('DOCUSIGN_USER_ID');
    const accountId = this.configService.get<string>('DOCUSIGN_ACCOUNT_ID');
    const basePath = this.configService.get<string>('DOCUSIGN_BASE_PATH') || 'https://demo.docusign.net/restapi';

    if (!integratorKey || !userId || !accountId) {
      this.logger.warn(
        'DocuSign credentials not fully configured. Some features may not work.',
      );
      return;
    }

    this.apiClient = new docusign.ApiClient();
    this.apiClient.setBasePath(basePath);
    this.accountId = accountId;
    this.basePath = basePath;
  }

  /**
   * Load the DocuSign RSA private key either from an env var (DOCUSIGN_PRIVATE_KEY)
   * or from a PEM file (DOCUSIGN_PRIVATE_KEY_PATH, relative to project root if not absolute).
   */
  private getPrivateKeyPem(): string {
    const inlineKey = this.configService.get<string>('DOCUSIGN_PRIVATE_KEY');
    if (inlineKey && inlineKey.trim().length > 0) {
      return inlineKey;
    }

    const keyPath = this.configService.get<string>('DOCUSIGN_PRIVATE_KEY_PATH');
    if (!keyPath) {
      throw new BadRequestException(
        'DocuSign private key not configured. Set DOCUSIGN_PRIVATE_KEY or DOCUSIGN_PRIVATE_KEY_PATH.',
      );
    }

    const absolutePath = path.isAbsolute(keyPath)
      ? keyPath
      : path.join(process.cwd(), keyPath);

    if (!fs.existsSync(absolutePath)) {
      throw new BadRequestException(
        `DocuSign private key file not found at path: ${absolutePath}`,
      );
    }

    const pem = fs.readFileSync(absolutePath, 'utf8');
    if (!pem.includes('BEGIN') || !pem.includes('PRIVATE KEY')) {
      throw new BadRequestException(
        `DocuSign private key file at ${absolutePath} does not look like a valid PEM private key`,
      );
    }

    return pem;
  }

  private async ensureAuthenticated(): Promise<void> {
    // Check if token is still valid (with 5 minute buffer)
    if (
      this.accessToken &&
      this.tokenExpiresAt &&
      this.tokenExpiresAt > new Date(Date.now() + 5 * 60 * 1000)
    ) {
      return;
    }

    // If already authenticating, wait for it
    if (this.isAuthenticating) {
      return await this.isAuthenticating;
    }

    // Start authentication
    this.isAuthenticating = this.authenticate();
    try {
      await this.isAuthenticating;
    } finally {
      this.isAuthenticating = null;
    }
  }

  private async authenticate(): Promise<void> {
    const integratorKey = this.configService.get<string>('DOCUSIGN_INTEGRATOR_KEY');
    const userId = this.configService.get<string>('DOCUSIGN_USER_ID');
    const privateKeyPem = this.getPrivateKeyPem();

    if (!integratorKey || !userId || !this.apiClient) {
      throw new BadRequestException('DocuSign is not properly configured');
    }

    try {
      const scopes = ['signature', 'impersonation'];
      const rsaKey = Buffer.from(privateKeyPem, 'utf8');

      const response = await this.apiClient.requestJWTUserToken(
        integratorKey,
        userId,
        scopes,
        rsaKey,
        3600,
      );

      this.accessToken = response.body.access_token;
      const expiresIn = response.body.expires_in || 3600;
      this.tokenExpiresAt = new Date(Date.now() + expiresIn * 1000);

      this.apiClient.addDefaultHeader('Authorization', `Bearer ${this.accessToken}`);
      this.logger.log('DocuSign authentication successful');
    } catch (error) {
      this.logger.error('DocuSign authentication failed', error);
      throw new BadRequestException(
        `DocuSign authentication failed: ${error.message}`,
      );
    }
  }

  /**
   * Get the template ID from configuration.
   * If DOCUSIGN_TEMPLATE_ID is set, use template-based signing.
   * Otherwise, fall back to document-based signing.
   */
  private getTemplateId(
    role: AgreementRole = UserRole.CHANNEL_PARTNER,
  ): string | null {
    // Role-specific template var falls back to the legacy DOCUSIGN_TEMPLATE_ID
    // (which historically only held the CP template).
    const roleKey =
      role === UserRole.OWNER
        ? 'DOCUSIGN_OWNER_TEMPLATE_ID'
        : 'DOCUSIGN_CHANNEL_PARTNER_TEMPLATE_ID';
    return (
      this.configService.get<string>(roleKey) ||
      this.configService.get<string>('DOCUSIGN_TEMPLATE_ID') ||
      null
    );
  }

  /**
   * Create a DocuSign template from the Channel Partner Agreement PDF.
   * This is a one-time setup method. After creating the template, save the template ID
   * to DOCUSIGN_TEMPLATE_ID environment variable.
   * 
   * @param templateName - Name for the template (default: "Channel Partner Agreement Template")
   * @returns Template ID that can be used for future envelope creation
   */
  async createTemplate(
    templateName: string = 'Channel Partner Agreement Template',
  ): Promise<{ templateId: string }> {
    try {
      if (!this.apiClient) {
        throw new BadRequestException('DocuSign is not properly configured');
      }

      await this.ensureAuthenticated();

      const { documentBase64, documentName } =
        this.getAgreementDocument(UserRole.CHANNEL_PARTNER);

      const templatesApi = new docusign.TemplatesApi(this.apiClient);

      // Create document for template
      const document = docusign.Document.constructFromObject({
        documentBase64: documentBase64,
        name: documentName,
        fileExtension: 'pdf',
        documentId: '1',
      });

      // Create signer role (template uses roles, not actual recipients)
      const signer = docusign.Signer.constructFromObject({
        roleName: 'Signer',
        recipientId: '1',
        routingOrder: '1',
      });

      // Create sign here tab
      const signHere = docusign.SignHere.constructFromObject({
        documentId: '1',
        pageNumber: '1',
        recipientId: '1',
        tabLabel: 'SignHereTab',
        xPosition: '195',
        yPosition: '147',
      });

      const tabs = docusign.Tabs.constructFromObject({
        signHereTabs: [signHere],
      });

      signer.tabs = tabs;

      // Create recipients
      const recipients = docusign.Recipients.constructFromObject({
        signers: [signer],
      });

      // Create template definition
      const template = docusign.EnvelopeTemplate.constructFromObject({
        name: templateName,
        description: 'Template for Channel Partner Agreement',
        documents: [document],
        recipients: recipients,
        emailSubject: 'Please sign the Channel Partner Agreement',
      });

      // Create the template
      const result = await templatesApi.createTemplate(this.accountId, {
        envelopeTemplate: template,
      });

      const templateId = result.templateId;
      this.logger.log(
        `Template created successfully with ID: ${templateId}. Save this ID to DOCUSIGN_TEMPLATE_ID environment variable.`,
      );

      return { templateId };
    } catch (error) {
      this.logger.error('Error creating DocuSign template', error);
      throw new BadRequestException(
        `Failed to create DocuSign template: ${error.message}`,
      );
    }
  }

  /**
   * Create an envelope from a DocuSign template.
   * This is more efficient than uploading the document each time.
   * 
   * @param templateId - The DocuSign template ID
   * @param userId - User ID for embedded signing
   * @param recipientEmail - Recipient email address
   * @param recipientName - Recipient name
   * @param returnUrl - URL to redirect after signing
   * @returns Envelope ID and signing URL
   */
  async createEnvelopeFromTemplate(
    templateId: string,
    userId: string,
    recipientEmail: string,
    recipientName: string,
    returnUrl: string,
  ): Promise<{ envelopeId: string; url: string }> {
    try {
      if (!this.apiClient) {
        throw new BadRequestException('DocuSign is not properly configured');
      }

      await this.ensureAuthenticated();

      const envelopesApi = new docusign.EnvelopesApi(this.apiClient);

      // Create signer with role assignment
      // IMPORTANT: roleName must exactly match the role name defined in the DocuSign template
      // The template was created with roleName: 'Signer', so we must use the same here
      const signer = docusign.TemplateRole.constructFromObject({
        email: recipientEmail,
        name: recipientName,
        roleName: 'Signer1', // Must match the role name in the template (created with 'Signer')
        // Required for embedded signing (Recipient View)
        clientUserId: userId,
      });

      // Create envelope from template
      const envelope = docusign.EnvelopeDefinition.constructFromObject({
        templateId: templateId,
        templateRoles: [signer],
        status: 'sent',
        emailSubject: 'Complete with Docusign: Channel_Partner_Agreement.pdf',
      });

      // Create and send envelope
      const results = await envelopesApi.createEnvelope(this.accountId, {
        envelopeDefinition: envelope,
      });

      const envelopeId = results.envelopeId;

      // Get signing URL
      const viewRequest = docusign.RecipientViewRequest.constructFromObject({
        authenticationMethod: 'none',
        email: recipientEmail,
        userName: recipientName,
        recipientId: '1',
        clientUserId: userId,
        returnUrl: returnUrl,
      });

      const viewResults = await envelopesApi.createRecipientView(
        this.accountId,
        envelopeId,
        { recipientViewRequest: viewRequest },
      );

      // Check if user already has an agreement
      const existingAgreement = await this.agreementRepository.findLatestByUserId(userId);
      
      if (existingAgreement) {
        // Update existing agreement with new envelope
        await this.agreementRepository.update(existingAgreement.id, {
          envelopeId,
          status: AgreementStatus.SENT,
          returnUrl,
          completedAt: null, // Reset completion date
        });
        this.logger.log(`Updated existing agreement for user ${userId} with new envelope ${envelopeId}`);
      } else {
        // Create new agreement
        await this.agreementRepository.create({
          userId,
          envelopeId,
          status: AgreementStatus.SENT,
          returnUrl,
        });
        this.logger.log(`Created new agreement for user ${userId} with envelope ${envelopeId}`);
      }

      return {
        envelopeId,
        url: viewResults.url,
      };
    } catch (error) {
      this.logger.error('Error creating DocuSign envelope from template', error);
      throw new BadRequestException(
        `Failed to create DocuSign envelope from template: ${error.message}`,
      );
    }
  }

  /**
   * Create an envelope for the fixed Channel Partner Agreement document.
   * Uses template if DOCUSIGN_TEMPLATE_ID is configured, otherwise falls back to document upload.
   * The document is loaded from DOCUSIGN_CHANNEL_PARTNER_AGREEMENT_PATH.
   */
  async createChannelPartnerAgreementEnvelope(
    userId: string,
    recipientEmail: string,
    recipientName: string,
    returnUrl: string,
    extraDetails?: { phone?: string; city?: string; firmName?: string },
    role: AgreementRole = UserRole.CHANNEL_PARTNER,
  ): Promise<{ envelopeId: string; url: string }> {
    // Check if a role-specific template ID is configured.
    const templateId = this.getTemplateId(role);

    if (templateId) {
      // Use template-based signing (more efficient)
      this.logger.log(`[${role}] Using template ${templateId} for envelope creation`);
      return this.createEnvelopeFromTemplate(
        templateId,
        userId,
        recipientEmail,
        recipientName,
        returnUrl,
      );
    } else {
      // Fall back to document-based signing
      this.logger.log(`[${role}] No template ID configured, using document upload`);
      const { documentBase64, documentName } =
        this.getAgreementDocument(role);

      return this.createEnvelope(
        userId,
        recipientEmail,
        recipientName,
        documentBase64,
        documentName,
        returnUrl,
        extraDetails,
      );
    }
  }

  async createEnvelope(
    userId: string,
    recipientEmail: string,
    recipientName: string,
    documentBase64: string,
    documentName: string,
    returnUrl: string,
    extraDetails?: { phone?: string; city?: string; firmName?: string },
  ): Promise<{ envelopeId: string; url: string }> {
    try {
      if (!this.apiClient) {
        throw new BadRequestException('DocuSign is not properly configured');
      }
      console.log('documentBase64', documentBase64);
      console.log('documentName', documentName);
      console.log('recipientEmail', recipientEmail);
      console.log('recipientName', recipientName);
      console.log('returnUrl', returnUrl);

      await this.ensureAuthenticated();

      const envelopesApi = new docusign.EnvelopesApi(this.apiClient);

      console.log('envelopesApi', envelopesApi);

      // Create document
      const document = docusign.Document.constructFromObject({
        documentBase64: documentBase64,
        name: documentName,
        fileExtension: 'pdf',
        documentId: '1',
      });

      console.log('document', document);

      // Create signer
      const signer = docusign.Signer.constructFromObject({
        email: recipientEmail,
        name: recipientName,
        recipientId: '1',
        routingOrder: '1',
        // Required for embedded signing (Recipient View)
        clientUserId: userId,
      });
      // Create sign here tab on page 2 (Partner Signature line)
      const signHere = docusign.SignHere.constructFromObject({
        documentId: '1',
        pageNumber: '2',
        recipientId: '1',
        tabLabel: 'SignHereTab',
        anchorString: 'Partner Signature:',
        anchorXOffset: '150',
        anchorYOffset: '-5',
      });

      // Pre-fill text tabs with user details
      const today = new Date();
      const dateStr = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;

      const textTabs = [
        docusign.Text.constructFromObject({
          documentId: '1', pageNumber: '1', recipientId: '1',
          tabLabel: 'PartnerName',
          anchorString: 'Mr./Ms.',
          anchorXOffset: '55', anchorYOffset: '-5',
          value: recipientName, locked: 'true', fontSize: 'Size10',
        }),
        docusign.Text.constructFromObject({
          documentId: '1', pageNumber: '1', recipientId: '1',
          tabLabel: 'PartnerAddress',
          anchorString: 'Address:',
          anchorXOffset: '70', anchorYOffset: '-5',
          value: extraDetails?.city || '', locked: 'true', fontSize: 'Size10',
        }),
        docusign.Text.constructFromObject({
          documentId: '1', pageNumber: '1', recipientId: '1',
          tabLabel: 'PartnerPhone',
          anchorString: 'Contact Number:',
          anchorXOffset: '130', anchorYOffset: '-5',
          value: extraDetails?.phone || '', locked: 'true', fontSize: 'Size10',
        }),
        docusign.Text.constructFromObject({
          documentId: '1', pageNumber: '2', recipientId: '1',
          tabLabel: 'SignPlace',
          anchorString: 'Place:',
          anchorXOffset: '50', anchorYOffset: '-5',
          value: extraDetails?.city || '', locked: 'true', fontSize: 'Size10',
        }),
      ];

      const tabs = docusign.Tabs.constructFromObject({
        signHereTabs: [signHere],
        textTabs: textTabs,
      });

      signer.tabs = tabs;

      // Create recipients
      const recipients = docusign.Recipients.constructFromObject({
        signers: [signer],
      });

      // Create envelope
      const envelope = docusign.EnvelopeDefinition.constructFromObject({
        emailSubject: 'Please sign the Channel Partner Agreement',
        documents: [document],
        recipients: recipients,
        status: 'sent',
      });

      // Create and send envelope
      const results = await envelopesApi.createEnvelope(this.accountId, {
        envelopeDefinition: envelope,
      });

      const envelopeId = results.envelopeId;

      // Get signing URL
      const viewRequest = docusign.RecipientViewRequest.constructFromObject({
        authenticationMethod: 'none',
        email: recipientEmail,
        userName: recipientName,
        recipientId: '1',
        clientUserId: userId,
        returnUrl: returnUrl,
      });

      const viewResults = await envelopesApi.createRecipientView(
        this.accountId,
        envelopeId,
        { recipientViewRequest: viewRequest },
      );

      // Check if user already has an agreement
      const existingAgreement = await this.agreementRepository.findLatestByUserId(userId);
      
      if (existingAgreement) {
        // Update existing agreement with new envelope
        await this.agreementRepository.update(existingAgreement.id, {
          envelopeId,
          status: AgreementStatus.SENT,
          returnUrl,
          completedAt: null, // Reset completion date
        });
        this.logger.log(`Updated existing agreement for user ${userId} with new envelope ${envelopeId}`);
      } else {
        // Create new agreement
        await this.agreementRepository.create({
          userId,
          envelopeId,
          status: AgreementStatus.SENT,
          returnUrl,
        });
        this.logger.log(`Created new agreement for user ${userId} with envelope ${envelopeId}`);
      }

      return {
        envelopeId,
        url: viewResults.url,
      };
    } catch (error) {
      this.logger.error('Error creating DocuSign envelope', error);
      throw new BadRequestException(
        `Failed to create DocuSign envelope: ${error.message}`,
      );
    }
  }

  async getEnvelopeStatus(envelopeId: string): Promise<AgreementStatus> {
    try {
      if (!this.apiClient) {
        throw new BadRequestException('DocuSign is not properly configured');
      }

      await this.ensureAuthenticated();

      const envelopesApi = new docusign.EnvelopesApi(this.apiClient);
      const envelope = await envelopesApi.getEnvelope(this.accountId, envelopeId);

      const status = envelope.status?.toLowerCase();

      // Map DocuSign status to our AgreementStatus enum
      switch (status) {
        case 'sent':
          return AgreementStatus.SENT;
        case 'delivered':
          return AgreementStatus.DELIVERED;
        case 'signed':
          return AgreementStatus.SIGNED;
        case 'completed':
          return AgreementStatus.COMPLETED;
        case 'declined':
          return AgreementStatus.DECLINED;
        case 'voided':
          return AgreementStatus.VOIDED;
        default:
          return AgreementStatus.SENT;
      }
    } catch (error) {
      this.logger.error('Error getting envelope status', error);
      throw new BadRequestException(
        `Failed to get envelope status: ${error.message}`,
      );
    }
  }

  async updateAgreementStatus(envelopeId: string): Promise<ChannelPartnerAgreement | null> {
    this.logger.log('Updating agreement status', { envelopeId });

    try {
      this.logger.debug('Fetching envelope status from DocuSign', { envelopeId });
      const status = await this.getEnvelopeStatus(envelopeId);
      
      this.logger.log('Envelope status retrieved', {
        envelopeId,
        status,
      });

      const updateData: Partial<ChannelPartnerAgreement> = {
        status,
      };

      if (status === AgreementStatus.COMPLETED) {
        updateData.completedAt = new Date();
        this.logger.log('Agreement marked as completed', {
          envelopeId,
          completedAt: updateData.completedAt,
        });
      }

      this.logger.debug('Updating agreement in database', {
        envelopeId,
        updateData,
      });

      const updatedAgreement = await this.agreementRepository.updateByEnvelopeId(
        envelopeId,
        updateData,
      );

      if (updatedAgreement) {
        this.logger.log('Agreement updated in database', {
          envelopeId,
          agreementId: updatedAgreement.id,
          status: updatedAgreement.status,
        });

        // Update user's docusign_agreement_signed flag if agreement is completed
        if (status === AgreementStatus.COMPLETED) {
          await this.userRepository.update(updatedAgreement.userId, {
            docusignAgreementSigned: true,
          });
          this.logger.log('User docusign_agreement_signed flag updated', {
            userId: updatedAgreement.userId,
            envelopeId,
          });
          
          // Note: KYC status will be checked when user calls getVerificationStepsStatus
          // or we could inject UserService here to call checkAndUpdateKycStatus
          // For now, it will be updated on next status check
        }
      } else {
        this.logger.warn('No agreement found with envelope ID', { envelopeId });
      }

      return updatedAgreement;
    } catch (error) {
      this.logger.error('Error updating agreement status', {
        envelopeId,
        error: error.message,
        stack: error.stack,
      });
      return null;
    }
  }

  async getEnvelopeDocuments(envelopeId: string): Promise<Buffer> {
    try {
      if (!this.apiClient) {
        throw new BadRequestException('DocuSign is not properly configured');
      }

      await this.ensureAuthenticated();

      const envelopesApi = new docusign.EnvelopesApi(this.apiClient);
      const results = await envelopesApi.getDocument(
        this.accountId,
        envelopeId,
        'combined',
      );

      return Buffer.from(results, 'base64');
    } catch (error) {
      this.logger.error('Error getting envelope documents', error);
      throw new BadRequestException(
        `Failed to get envelope documents: ${error.message}`,
      );
    }
  }

  async handleWebhook(
    envelopeId: string,
    status: string,
  ): Promise<ChannelPartnerAgreement | null> {
    this.logger.log('Processing webhook in DocuSignService', {
      envelopeId,
      receivedStatus: status,
    });

    try {
      const result = await this.updateAgreementStatus(envelopeId);
      
      if (result) {
        this.logger.log('Agreement status updated successfully', {
          envelopeId,
          agreementId: result.id,
          newStatus: result.status,
          previousStatus: status,
        });
      } else {
        this.logger.warn('No agreement found or updated for envelope', {
          envelopeId,
          receivedStatus: status,
        });
      }

      return result;
    } catch (error) {
      this.logger.error('Error in handleWebhook', {
        envelopeId,
        receivedStatus: status,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }
}

