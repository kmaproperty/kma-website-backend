import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ContactUsRepository } from './repositories/contact-us.repository';
import { JoinUsEnquiryRepository } from './repositories/join-us-enquiry.repository';
import { SalesEnquiryRepository } from './repositories/sales-enquiry.repository';
import {
  CreateContactUsDto,
  CreateContactUsResponseDto,
  CreateJoinUsDto,
  CreateJoinUsResponseDto,
  CreateSalesEnquiryDto,
  CreateSalesEnquiryResponseDto,
} from './dto';
import { ContactUs } from './entities/contact-us.entity';

@Injectable()
export class ContactUsService {
  private readonly logger = new Logger(ContactUsService.name);

  constructor(
    private readonly contactUsRepository: ContactUsRepository,
    private readonly joinUsEnquiryRepository: JoinUsEnquiryRepository,
    private readonly salesEnquiryRepository: SalesEnquiryRepository,
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
}
