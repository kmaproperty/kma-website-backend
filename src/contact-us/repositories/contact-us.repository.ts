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
   * Get all contact submissions with pagination and search
   */
  async findAllWithSearch(
    skip: number = 0,
    take: number = 10,
    search?: string,
  ): Promise<{ items: ContactUs[]; total: number }> {
    const queryBuilder = this.contactUsRepository.createQueryBuilder('contact');

    if (search) {
      queryBuilder.where(
        '(LOWER(contact.firstName) LIKE LOWER(:search) OR LOWER(contact.lastName) LIKE LOWER(:search) OR LOWER(contact.email) LIKE LOWER(:search) OR contact.phoneNumber LIKE :search)',
        { search: `%${search}%` },
      );
    }

    queryBuilder.orderBy('contact.createdAt', 'DESC');
    queryBuilder.skip(skip).take(take);

    const [items, total] = await queryBuilder.getManyAndCount();
    return { items, total };
  }

  /**
   * Get total count of contact submissions
   */
  async count(): Promise<number> {
    return await this.contactUsRepository.count();
  }
}
