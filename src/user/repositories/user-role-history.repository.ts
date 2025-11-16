import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRoleHistory } from '../entities/user-role-history.entity';

@Injectable()
export class UserRoleHistoryRepository {
  constructor(
    @InjectRepository(UserRoleHistory)
    private readonly repository: Repository<UserRoleHistory>,
  ) {}

  async create(entry: Partial<UserRoleHistory>): Promise<UserRoleHistory> {
    const rec = this.repository.create(entry);
    return this.repository.save(rec);
  }
}


