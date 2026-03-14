import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TeamMember } from '../entities/team-member.entity';

@Injectable()
export class TeamMemberRepository {
  constructor(
    @InjectRepository(TeamMember)
    private readonly repository: Repository<TeamMember>,
  ) {}

  async findAll(): Promise<TeamMember[]> {
    return await this.repository.find({
      order: { displayOrder: 'ASC', createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<TeamMember | null> {
    return await this.repository.findOne({ where: { id } });
  }

  async create(data: Partial<TeamMember>): Promise<TeamMember> {
    const member = this.repository.create(data);
    return await this.repository.save(member);
  }

  async update(id: string, data: Partial<TeamMember>): Promise<void> {
    await this.repository.update(id, data);
  }

  async delete(id: string): Promise<void> {
    await this.repository.softDelete(id);
  }

  async count(): Promise<number> {
    return await this.repository.count();
  }
}
