import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MasterSociety } from '../entities/master-society.entity';

@Injectable()
export class SocietyRepository {
  constructor(
    @InjectRepository(MasterSociety)
    private readonly societyRepository: Repository<MasterSociety>,
  ) {}

  async findAll(): Promise<MasterSociety[]> {
    return await this.societyRepository.find({
      order: { name: 'ASC' },
    });
  }

  async findById(id: string): Promise<MasterSociety | null> {
    return await this.societyRepository.findOne({
      where: { id },
    });
  }

  async findByCityId(cityId: string): Promise<MasterSociety[]> {
    return await this.societyRepository.find({
      where: { cityId },
      order: { name: 'ASC' },
    });
  }

  async findByLocalityId(localityId: string): Promise<MasterSociety[]> {
    return await this.societyRepository.find({
      where: { localityId },
      order: { name: 'ASC' },
    });
  }
}
