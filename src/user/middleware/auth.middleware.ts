import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from '../repositories/user.repository';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userRepository: UserRepository,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      // Extract token from Authorization header
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new UnauthorizedException(
          'Authorization header missing or invalid',
        );
      }

      const token = authHeader.substring(7); // Remove 'Bearer ' prefix

      // Verify JWT token
      const decodedToken = this.jwtService.verify(token);

      // Validate token type
      if (decodedToken.type !== 'access_token') {
        throw new UnauthorizedException('Invalid token type');
      }

      // Find user by ID from token
      const user = await this.userRepository.findById(decodedToken.sub);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Check if user is active
      if (!user.isActive) {
        throw new UnauthorizedException('User account is deactivated');
      }

      // Check if phone is verified
      if (!user.phoneVerified) {
        throw new UnauthorizedException('Phone number is not verified');
      }

      // Populate user details in request
      req.user = {
        id: user.id,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive,
        phoneVerified: user.phoneVerified,
      };

      next();
    } catch (error) {
      if (error instanceof Error && error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token has expired');
      } else if (error instanceof Error && error.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Invalid token');
      } else {
        throw new UnauthorizedException('Authentication failed');
      }
    }
  }
}
