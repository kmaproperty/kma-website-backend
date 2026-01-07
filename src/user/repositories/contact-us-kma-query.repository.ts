import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContactUsKmaQuery } from '../entities/contact-us-kma-query.entity';

@Injectable()
export class ContactUsKmaQueryRepository {
  constructor(
    @InjectRepository(ContactUsKmaQuery)
    private readonly contactUsKmaQueryRepository: Repository<ContactUsKmaQuery>,
  ) {}

  /**
   * Create a new contact us KMA query
   */
  async create(
    contactData: Partial<ContactUsKmaQuery>,
  ): Promise<ContactUsKmaQuery> {
    const contact = this.contactUsKmaQueryRepository.create(contactData);
    return await this.contactUsKmaQueryRepository.save(contact);
  }

  /**
   * Get all contact us KMA queries with pagination
   */
  async findAll(
    skip: number = 0,
    take: number = 10,
  ): Promise<ContactUsKmaQuery[]> {
    return await this.contactUsKmaQueryRepository.find({
      relations: ['endUser'],
      order: { createdAt: 'DESC' },
      skip,
      take,
    });
  }

  /**
   * Get all contact us KMA queries with pagination and search
   */
  async findAllWithSearch(
    skip: number = 0,
    take: number = 10,
    search?: string,
  ): Promise<{ items: ContactUsKmaQuery[]; total: number }> {
    const queryBuilder = this.contactUsKmaQueryRepository
      .createQueryBuilder('query')
      .leftJoinAndSelect('query.endUser', 'endUser');

    if (search) {
      queryBuilder.where(
        '(LOWER(query.name) LIKE LOWER(:search) OR LOWER(query.email) LIKE LOWER(:search) OR query.phoneNumber LIKE :search)',
        { search: `%${search}%` },
      );
    }

    queryBuilder.orderBy('query.createdAt', 'DESC');
    queryBuilder.skip(skip).take(take);

    const [items, total] = await queryBuilder.getManyAndCount();
    return { items, total };
  }

  /**
   * Get total count of contact us KMA queries
   */
  async count(): Promise<number> {
    return await this.contactUsKmaQueryRepository.count();
  }
}

