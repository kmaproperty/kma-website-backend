import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { SessionPropertyView } from '../entities/session-property-view.entity';

@Injectable()
export class SessionPropertyViewRepository {
  constructor(
    @InjectRepository(SessionPropertyView)
    private readonly repository: Repository<SessionPropertyView>,
  ) {}

  async create(viewData: Partial<SessionPropertyView>): Promise<SessionPropertyView> {
    const view = this.repository.create(viewData);
    return await this.repository.save(view);
  }

  async findBySessionAndProperty(
    sessionId: string,
    propertyId: string,
  ): Promise<SessionPropertyView | null> {
    return await this.repository.findOne({
      where: {
        sessionId,
        propertyId,
        deletedAt: IsNull(),
      },
    });
  }

  async findBySessionId(sessionId: string): Promise<SessionPropertyView[]> {
    return await this.repository.find({
      where: {
        sessionId,
        deletedAt: IsNull(),
      },
    });
  }

  async incrementViewCount(
    sessionId: string,
    propertyId: string,
  ): Promise<SessionPropertyView> {
    const existing = await this.findBySessionAndProperty(sessionId, propertyId);
    
    if (existing) {
      existing.viewCount += 1;
      return await this.repository.save(existing);
    } else {
      return await this.create({
        sessionId,
        propertyId,
        viewCount: 1,
      });
    }
  }

  async getUniquePropertyCount(sessionId: string): Promise<number> {
    return await this.repository.count({
      where: {
        sessionId,
        deletedAt: IsNull(),
      },
    });
  }
}

