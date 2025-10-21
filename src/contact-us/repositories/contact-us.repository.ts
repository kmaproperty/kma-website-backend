import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContactUs } from '../entities/contact-us.entity';

@Injectable()
export class ContactUsRepository {
  constructor(
    @InjectRepository(ContactUs)
    private readonly contactUsRepository: Repository<ContactUs>,
  ) {}

  /**
   * Create a new contact form submission
   */
  async create(contactData: Partial<ContactUs>): Promise<ContactUs> {
    const contact = this.contactUsRepository.create(contactData);
    return await this.contactUsRepository.save(contact);
  }

  /**
   * Get all contact submissions with pagination
   */
  async findAll(skip: number = 0, take: number = 10): Promise<ContactUs[]> {
    return await this.contactUsRepository.find({
      order: { createdAt: 'DESC' },
      skip,
      take,
    });
  }

  /**
   * Get total count of contact submissions
   */
  async count(): Promise<number> {
    return await this.contactUsRepository.count();
  }
}