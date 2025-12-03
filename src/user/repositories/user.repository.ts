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
    phoneVerified?: boolean;
  }): Promise<{ items: User[]; total: number }> {
    const { page, limit, role, search, isActive, phoneVerified } = options;
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
}
