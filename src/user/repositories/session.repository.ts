import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Session } from '../entities/session.entity';

@Injectable()
export class SessionRepository {
  constructor(
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
  ) {}

  async create(sessionData: Partial<Session>): Promise<Session> {
    const session = this.sessionRepository.create(sessionData);
    return await this.sessionRepository.save(session);
  }

  async findBySessionId(sessionId: string): Promise<Session | null> {
    return await this.sessionRepository.findOne({
      where: {
        sessionId,
        deletedAt: IsNull(),
      },
      relations: ['propertyViews'],
    });
  }

  async findByUserId(userId: string): Promise<Session[]> {
    return await this.sessionRepository.find({
      where: {
        userId,
        deletedAt: IsNull(),
      },
      relations: ['propertyViews'],
    });
  }

  async findUnmergedBySessionId(sessionId: string): Promise<Session | null> {
    return await this.sessionRepository.findOne({
      where: {
        sessionId,
        userId: IsNull(),
        deletedAt: IsNull(),
      },
      relations: ['propertyViews'],
    });
  }

  async update(session: Session): Promise<Session> {
    return await this.sessionRepository.save(session);
  }

  async mergeSession(sessionId: string, userId: string): Promise<Session | null> {
    const session = await this.findUnmergedBySessionId(sessionId);
    if (!session) {
      return null;
    }

    session.userId = userId;
    session.mergedAt = new Date();
    return await this.sessionRepository.save(session);
  }
}

