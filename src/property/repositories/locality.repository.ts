import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MasterLocality } from '../entities/master-locality.entity';

@Injectable()
export class LocalityRepository {
  constructor(
    @InjectRepository(MasterLocality)
    private readonly localityRepository: Repository<MasterLocality>,
  ) {}

  async findAll(): Promise<MasterLocality[]> {
    return await this.localityRepository.find({
      order: { name: 'ASC' },
    });
  }

  async findById(id: string): Promise<MasterLocality | null> {
    return await this.localityRepository.findOne({
      where: { id },
    });
  }

  async findByCityId(cityId: string): Promise<MasterLocality[]> {
    return await this.localityRepository.find({
      where: { cityId },
      order: { name: 'ASC' },
    });
  }
}
