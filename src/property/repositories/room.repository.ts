import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room } from '../entities/room.entity';

@Injectable()
export class RoomRepository {
  constructor(
    @InjectRepository(Room)
    private readonly repository: Repository<Room>,
  ) {}

  async create(data: Partial<Room>): Promise<Room> {
    const room = this.repository.create(data);
    return this.repository.save(room);
  }

  async findById(id: string): Promise<Room | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findByName(name: string): Promise<Room | null> {
    return this.repository.findOne({ where: { name } });
  }

  async findAllActive(): Promise<Room[]> {
    return this.repository.find({
      where: { isActive: true },
      order: { displayOrder: 'ASC', name: 'ASC' },
    });
  }

  async findAll(): Promise<Room[]> {
    return this.repository.find({
      order: { displayOrder: 'ASC', name: 'ASC' },
    });
  }

  async findWithPagination(params: {
    skip: number;
    take: number;
    search?: string;
  }): Promise<{ items: Room[]; total: number }> {
    const queryBuilder = this.repository
      .createQueryBuilder('room')
      .orderBy('room.displayOrder', 'ASC')
      .addOrderBy('room.name', 'ASC')
      .skip(params.skip)
      .take(params.take);

    if (params.search) {
      queryBuilder.where('LOWER(room.name) LIKE LOWER(:search)', {
        search: `%${params.search}%`,
      });
    }

    const [items, total] = await queryBuilder.getManyAndCount();
    return { items, total };
  }

  async update(id: string, data: Partial<Room>): Promise<void> {
    await this.repository.update(id, data);
  }

  async delete(id: string): Promise<void> {
    await this.repository.softDelete(id);
  }
}

