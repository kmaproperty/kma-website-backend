import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
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

  async searchByNameAndCity(
    query: string,
    cityId: string,
    limit: number = 10,
  ): Promise<MasterSociety[]> {
    return await this.societyRepository.find({
      where: {
        name: ILike(`%${query}%`),
        cityId: cityId,
      },
      order: { name: 'ASC' },
      take: limit,
    });
  }

  async searchByName(
    query: string,
    limit: number = 10,
  ): Promise<MasterSociety[]> {
    return await this.societyRepository.find({
      where: { name: ILike(`%${query}%`) },
      order: { name: 'ASC' },
      take: limit,
    });
  }

  async createSociety(
    societyData: Partial<MasterSociety>,
  ): Promise<MasterSociety> {
    const society = this.societyRepository.create(societyData);
    return await this.societyRepository.save(society);
  }

  async updateSociety(
    id: string,
    updateData: Partial<MasterSociety>,
  ): Promise<void> {
    await this.societyRepository.update(id, updateData);
  }
}
