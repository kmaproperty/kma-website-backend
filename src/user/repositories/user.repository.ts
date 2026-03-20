import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { UserRole } from '../enum/user-role.enum';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Create a new user
   */
  async create(userData: Partial<User>): Promise<User> {
    const user = this.userRepository.create(userData);
    return await this.userRepository.save(user);
  }

  /**
   * Find user by ID
   */
  async findById(id: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { id } });
  }

  /**
   * Find user by phone number
   * Note: With multiple users per phone, this returns the first match
   * Use findByPhoneAndRole for specific role lookup
   */
  async findByPhone(phone: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { phone } });
  }

  /**
   * Find user by phone number and role
   * This is the preferred method when role is known
   */
  async findByPhoneAndRole(phone: string, role: UserRole): Promise<User | null> {
    return await this.userRepository.findOne({ 
      where: { phone, role } 
    });
  }

  /**
   * Find all users with the same phone number (different roles)
   */
  async findAllByPhone(phone: string): Promise<User[]> {
    return await this.userRepository.find({ 
      where: { phone },
      order: { createdAt: 'ASC' }
    });
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { email } });
  }

  /**
   * Update user by ID
   */
  async update(id: string, updateData: Partial<User>): Promise<User | null> {
    await this.userRepository.update(id, updateData);
    return await this.findById(id);
  }

  /**
   * Delete user by ID
   */
  async delete(id: string): Promise<boolean> {
    const result = await this.userRepository.delete(id);
    return (result.affected || 0) > 0;
  }

  /**
   * Find users with pagination and optional filters
   */
  async findPaginated(options: {
    page: number;
    limit: number;
    role?: string;
    search?: string;
    isActive?: boolean;
    isBlocked?: boolean;
    phoneVerified?: boolean;
  }): Promise<{ items: User[]; total: number }> {
    const { page, limit, role, search, isActive, isBlocked, phoneVerified } = options;
    const qb = this.userRepository
      .createQueryBuilder('user')
      .orderBy('user.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (role) {
      qb.andWhere('user.role = :role', { role });
    }

    if (isActive !== undefined) {
      qb.andWhere('user.isActive = :isActive', { isActive });
    }

    if (isBlocked !== undefined) {
      qb.andWhere('user.isBlocked = :isBlocked', { isBlocked });
    }

    if (phoneVerified !== undefined) {
      qb.andWhere('user.phoneVerified = :phoneVerified', { phoneVerified });
    }

    if (search) {
      qb.andWhere(
        '(user.name ILIKE :search OR user.phone ILIKE :search OR user.email ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    const [items, total] = await qb.getManyAndCount();
    return { items, total };
  }

  /**
   * Find channel partners with filters and pagination
   */
  async findChannelPartners(options: {
    page: number;
    limit: number;
    search?: string;
    city?: string;
    experience?: number;
    propertyCountMin?: number;
    propertyCountMax?: number | null;
  }): Promise<{ items: User[]; total: number }> {
    const { page, limit, search, city, experience, propertyCountMin, propertyCountMax } = options;
    
    // Base query builder for filtering
    const baseQb = this.userRepository
      .createQueryBuilder('user')
      .where('user.role = :role', { role: UserRole.CHANNEL_PARTNER })
      .andWhere('user.isActive = :isActive', { isActive: true })
      .andWhere('user.isBlocked = :isBlocked', { isBlocked: false })
      .andWhere('user.kycCompleted = :kycCompleted', { kycCompleted: true });

    if (search?.trim()) {
      const searchTerm = `%${search.trim()}%`;
      baseQb.andWhere(
        '(user.name ILIKE :search OR user.firmName ILIKE :search)',
        { search: searchTerm },
      );
    }

    if (city?.trim()) {
      const cityTerm = `%${city.trim()}%`;
      baseQb.andWhere('user.cities ILIKE :city', { city: cityTerm });
    }

    // Filter by experience (years from businessSince)
    if (experience !== undefined) {
      const minDate = new Date();
      minDate.setFullYear(minDate.getFullYear() - experience);
      baseQb.andWhere('user.businessSince IS NOT NULL')
        .andWhere('user.businessSince <= :minDate', { minDate: minDate.toISOString().split('T')[0] });
    }

    // If property count filter is needed, use a subquery approach
    if (propertyCountMin !== undefined) {
      const userIdsWithPropertyCount = this.userRepository
        .createQueryBuilder('u')
        .select('u.id', 'userId')
        .addSelect('COUNT(p.id)', 'propertyCount')
        .leftJoin('properties', 'p', 'p.userId = u.id AND p.isDeleted = false')
        .where('u.role = :role', { role: UserRole.CHANNEL_PARTNER })
        .andWhere('u.isActive = :isActive', { isActive: true })
        .andWhere('u.isBlocked = :isBlocked', { isBlocked: false })
        .andWhere('u.kycCompleted = :kycCompleted', { kycCompleted: true })
        .groupBy('u.id');

      // Apply same filters as base query
      if (search?.trim()) {
        const searchTerm = `%${search.trim()}%`;
        userIdsWithPropertyCount.andWhere(
          '(u.name ILIKE :search OR u.firmName ILIKE :search)',
          { search: searchTerm },
        );
      }

      if (city?.trim()) {
        const cityTerm = `%${city.trim()}%`;
        userIdsWithPropertyCount.andWhere('u.cities ILIKE :city', { city: cityTerm });
      }

      if (experience !== undefined) {
        const minDate = new Date();
        minDate.setFullYear(minDate.getFullYear() - experience);
        userIdsWithPropertyCount
          .andWhere('u.businessSince IS NOT NULL')
          .andWhere('u.businessSince <= :minDate', { minDate: minDate.toISOString().split('T')[0] });
      }

      if (propertyCountMax === null) {
        userIdsWithPropertyCount.having('COUNT(p.id) >= :propertyCountMin', {
          propertyCountMin,
        });
      } else {
        userIdsWithPropertyCount
          .having('COUNT(p.id) >= :propertyCountMin', { propertyCountMin })
          .andHaving('COUNT(p.id) < :propertyCountMax', { propertyCountMax });
      }

      const filteredUserIds = await userIdsWithPropertyCount.getRawMany();
      const userIds = filteredUserIds.map((row) => row.userId);

      if (userIds.length === 0) {
        return { items: [], total: 0 };
      }

      baseQb.andWhere('user.id IN (:...userIds)', { userIds });
    }

    // Get total count
    const total = await baseQb.getCount();

    // Apply pagination and get items
    const items = await baseQb
      .orderBy('user.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return { items, total };
  }

  async countByRoleAndActive(role: string, isActive: boolean): Promise<number> {
    return this.userRepository.count({
      where: { role: role as UserRole, isActive },
    });
  }

  async countByRoleAndVerified(role: string): Promise<number> {
    return this.userRepository.count({
      where: { role: role as UserRole, phoneVerified: true, isActive: true },
    });
  }

  async countByRoleAndKyc(role: string): Promise<number> {
    return this.userRepository.count({
      where: { role: role as UserRole, kycCompleted: true, isActive: true },
    });
  }
}
