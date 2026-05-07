import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ContactUsRepository } from './repositories/contact-us.repository';
import { JoinUsEnquiryRepository } from './repositories/join-us-enquiry.repository';
import { SalesEnquiryRepository } from './repositories/sales-enquiry.repository';
import { ReferralEnquiryRepository } from './repositories/referral-enquiry.repository';
import {
  CreateContactUsDto,
  CreateContactUsResponseDto,
  CreateJoinUsDto,
  CreateJoinUsResponseDto,
  CreateReferralEnquiryDto,
  CreateReferralEnquiryResponseDto,
  CreateSalesEnquiryDto,
  CreateSalesEnquiryResponseDto,
} from './dto';
import { ContactUs } from './entities/contact-us.entity';
import { ZohoService } from '../zoho/zoho.service';

@Injectable()
export class ContactUsService {
  private readonly logger = new Logger(ContactUsService.name);

  constructor(
    private readonly contactUsRepository: ContactUsRepository,
    private readonly joinUsEnquiryRepository: JoinUsEnquiryRepository,
    private readonly salesEnquiryRepository: SalesEnquiryRepository,
    private readonly referralEnquiryRepository: ReferralEnquiryRepository,
    private readonly zohoService: ZohoService,
  ) {}

  /**
   * Create a new contact form submission
   */
  async createContactForm(
    createContactUsDto: CreateContactUsDto,
  ): Promise<CreateContactUsResponseDto> {
    try {
      const contactData: Partial<ContactUs> = {
        firstName: createContactUsDto.firstName,
        lastName: createContactUsDto.lastName || null,
        email: createContactUsDto.email || null,
        phoneNumber: createContactUsDto.phoneNumber,
        message: createContactUsDto.message,
      };

      const contact = await this.contactUsRepository.create(contactData);

      return {
        success: true,
        message: 'Contact form submitted successfully',
        contactId: contact.id,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Failed to create contact form: ${errorMessage}`,
        error instanceof Error ? error.stack : '',
      );
      throw new InternalServerErrorException(
        'Failed to submit contact form. Please try again later.',
      );
    }
  }

  /**
   * Get all contact forms with pagination
   */
  async getAllContacts(
    skip: number = 0,
    take: number = 10,
  ): Promise<{
    contacts: ContactUs[];
    total: number;
  }> {
    const [contacts, total] = await Promise.all([
      this.contactUsRepository.findAll(skip, take),
      this.contactUsRepository.count(),
    ]);

    return { contacts, total };
  }

  /**
   * Submit a Join Us (channel partner application) enquiry
   */
  async createJoinUsEnquiry(dto: CreateJoinUsDto): Promise<CreateJoinUsResponseDto> {
    try {
      const enquiry = await this.joinUsEnquiryRepository.create({
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email || null,
        phoneNumber: dto.phoneNumber,
        state: dto.state || null,
        city: dto.city || null,
        message: dto.message || null,
      });

      return {
        success: true,
        message: 'Application submitted successfully',
        enquiryId: enquiry.id,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to create join-us enquiry: ${errorMessage}`, error instanceof Error ? error.stack : '');
      throw new InternalServerErrorException('Failed to submit application. Please try again later.');
    }
  }

  /**
   * Submit a Sales Enquiry / Request Callback
   */
  async createSalesEnquiry(dto: CreateSalesEnquiryDto): Promise<CreateSalesEnquiryResponseDto> {
    try {
      const enquiry = await this.salesEnquiryRepository.create({
        name: dto.name,
        email: dto.email || null,
        phoneNumber: dto.phoneNumber,
        message: dto.message || null,
        type: 'callback',
      });

      return {
        success: true,
        message: 'Sales enquiry submitted successfully. We will call you back shortly.',
        enquiryId: enquiry.id,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to create sales enquiry: ${errorMessage}`, error instanceof Error ? error.stack : '');
      throw new InternalServerErrorException('Failed to submit enquiry. Please try again later.');
    }
  }

  /**
   * Submit a refer-and-earn enquiry and forward it to Zoho Flow webhook.
   */
  async createReferralEnquiry(
    dto: CreateReferralEnquiryDto,
  ): Promise<CreateReferralEnquiryResponseDto> {
    try {
      await this.referralEnquiryRepository.create({
        referrerName: dto.referrerName.trim(),
        referrerPhone: dto.referrerPhone.trim(),
        clientName: dto.clientName.trim(),
        clientMobile: dto.clientMobile.trim(),
        propertyType: dto.propertyType,
        location: dto.location?.trim() || null,
        channelPartnerId: dto.channelPartnerId?.trim() || null,
      });

      const payload = {
        referral: {
          referrer_name: dto.referrerName,
          referrer_phone: dto.referrerPhone,
          client_name: dto.clientName,
          client_mobile: dto.clientMobile,
          property_type: dto.propertyType,
          location: dto.location?.trim() || 'NA',
          channel_partner_id: dto.channelPartnerId?.trim() || 'NA',
          via_partner: Boolean(dto.channelPartnerId?.trim()),
          source: 'buyer_refer_and_earn',
        },
      };

      const result = await this.zohoService.forwardReferralToFlow(payload);
      if (!result.success) {
        this.logger.warn(
          `Referral Zoho sync failed: status=${result.status} error=${result.error || 'unknown'}`,
        );
        throw new InternalServerErrorException(
          'Failed to submit referral right now. Please try again later.',
        );
      }

      return {
        success: true,
        message: 'Referral submitted successfully',
      };
    } catch (error) {
      if (error instanceof InternalServerErrorException) {
        throw error;
      }
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Failed to submit referral enquiry: ${errorMessage}`,
        error instanceof Error ? error.stack : '',
      );
      throw new InternalServerErrorException(
        'Failed to submit referral right now. Please try again later.',
      );
    }
  }
}
