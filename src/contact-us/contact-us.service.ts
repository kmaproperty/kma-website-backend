import { Injectable } from '@nestjs/common';
import { ContactUsRepository } from './repositories/contact-us.repository';
import { CreateContactUsDto, CreateContactUsResponseDto } from './dto';
import { ContactUs } from './entities/contact-us.entity';

@Injectable()
export class ContactUsService {
  constructor(private readonly contactUsRepository: ContactUsRepository) {}

  /**
   * Create a new contact form submission
   */
  async createContactForm(
    createContactUsDto: CreateContactUsDto,
  ): Promise<CreateContactUsResponseDto> {
    try {
      const contactData: Partial<ContactUs> = {
        firstName: createContactUsDto.firstName,
        lastName: createContactUsDto.lastName,
        email: createContactUsDto.email || null,
        phoneNumber: createContactUsDto.phoneNumber,
        message: createContactUsDto.message || null,
      };

      const contact = await this.contactUsRepository.create(contactData);

      return {
        success: true,
        message: 'Contact form submitted successfully',
        contactId: contact.id,
      };
    } catch (error) {
      throw new Error(`Failed to create contact form: ${error.message}`);
    }
  }

  /**
   * Get all contact forms with pagination
   */
  async getAllContacts(skip: number = 0, take: number = 10): Promise<{
    contacts: ContactUs[];
    total: number;
  }> {
    const [contacts, total] = await Promise.all([
      this.contactUsRepository.findAll(skip, take),
      this.contactUsRepository.count(),
    ]);

    return { contacts, total };
  }
}