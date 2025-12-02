import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
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

  async searchByNameAndCity(
    query: string,
    cityId: string,
    limit: number = 10,
  ): Promise<MasterLocality[]> {
    return await this.localityRepository.find({
      where: {
        name: ILike(`%${query}%`),
        cityId: cityId,
      },
      relations: ['city'],
      order: { name: 'ASC' },
      take: limit,
    });
  }

  async searchByNameAndCityAndSociety(
    query: string,
    cityId: string,
    societyId: string,
    limit: number = 10,
  ): Promise<MasterLocality[]> {
    return await this.localityRepository.find({
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
  ): Promise<MasterLocality[]> {
    return await this.localityRepository.find({
      where: { name: ILike(`%${query}%`) },
      relations: ['city'],
      order: { name: 'ASC' },
      take: limit,
    });
  }

  async createLocality(
    localityData: Partial<MasterLocality>,
  ): Promise<MasterLocality> {
    const locality = this.localityRepository.create(localityData);
    return await this.localityRepository.save(locality);
  }

  async updateLocality(
    id: string,
    updateData: Partial<MasterLocality>,
  ): Promise<void> {
    await this.localityRepository.update(id, updateData);
  }

  async deleteLocality(id: string): Promise<void> {
    await this.localityRepository.softDelete(id);
  }

  async findPaginated(options: {
    page: number;
    limit: number;
    search?: string;
    cityId?: string;
  }): Promise<{ items: MasterLocality[]; total: number }> {
    const { page, limit, search, cityId } = options;
    const qb = this.localityRepository
      .createQueryBuilder('locality')
      .leftJoinAndSelect('locality.city', 'city')
      .orderBy('locality.name', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    if (cityId) {
      qb.andWhere('locality.cityId = :cityId', { cityId });
    }

    if (search) {
      qb.andWhere(
        '(locality.name ILIKE :search OR locality.sector ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    const [items, total] = await qb.getManyAndCount();
    return { items, total };
  }
}
