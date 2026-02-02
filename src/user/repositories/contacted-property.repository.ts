import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { ContactedProperty } from '../entities/contacted-property.entity';

@Injectable()
export class ContactedPropertyRepository {
  constructor(
    @InjectRepository(ContactedProperty)
    private readonly repository: Repository<ContactedProperty>,
  ) {}

  async create(data: Partial<ContactedProperty>): Promise<ContactedProperty> {
    const entity = this.repository.create(data);
    return await this.repository.save(entity);
  }

  /**
   * Count contacted properties by session (anonymous users)
   */
  async countBySession(sessionId: string): Promise<number> {
    return await this.repository.count({
      where: {
        sessionId,
        deletedAt: IsNull(),
      },
    });
  }

  /**
   * Count contacted properties by user (logged-in users)
   */
  async countByUserId(userId: string): Promise<number> {
    return await this.repository.count({
      where: {
        userId,
        deletedAt: IsNull(),
      },
    });
  }

  /**
   * Attach userId to all contacted_properties records with given sessionId (called on login/signup)
   */
  async attachUserToSession(sessionId: string, userId: string): Promise<void> {
    await this.repository
      .createQueryBuilder()
      .update(ContactedProperty)
      .set({ userId })
      .where('session_id = :sessionId', { sessionId })
      .andWhere('deleted_at IS NULL')
      .execute();
  }
}
