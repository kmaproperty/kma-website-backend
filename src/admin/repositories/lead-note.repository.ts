import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LeadNote } from '../entities/lead-note.entity';

@Injectable()
export class LeadNoteRepository {
  constructor(
    @InjectRepository(LeadNote)
    private readonly repository: Repository<LeadNote>,
  ) {}

  async create(data: Partial<LeadNote>): Promise<LeadNote> {
    const note = this.repository.create(data);
    return this.repository.save(note);
  }

  async findByLeadId(leadId: string): Promise<LeadNote[]> {
    return this.repository.find({
      where: { leadId },
      order: { createdAt: 'DESC' },
    });
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}

