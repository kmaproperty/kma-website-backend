import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class TokenVerificationMiddleware implements NestMiddleware {
  private readonly logger = new Logger(TokenVerificationMiddleware.name);

  constructor(private readonly jwtService: JwtService) {}

  use(req: Request, res: Response, next: NextFunction) {
    try {
      this.logger.debug(`Authorization header: ${req.headers.authorization ? 'present' : 'missing'}`);

      // Try to extract token from Authorization header first
      const token = req.headers?.authorization?.split(' ')[1];

      if (!token) {
        this.logger.warn('No token found in authorization header');
        throw new UnauthorizedException('Token is required');
      }

      // Verify JWT token with proper typing
      const decodedToken = this.jwtService.verify<{
        sub: string;
        phone: string;
        role: string;
        type: string;
      }>(token);

      // Validate token type
      if (decodedToken.type !== 'access_token') {
        throw new UnauthorizedException('Invalid token type');
      }

      // Populate token data in request
      req.tokenData = {
        sub: decodedToken.sub,
        phone: decodedToken.phone,
        role: decodedToken.role as any, // Role is validated by enum in database
        type: decodedToken.type as 'access_token' | 'refresh_token',
      };

      next();
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error; // Re-throw UnauthorizedException as-is
      }
      
      this.logger.error(`Token verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      if (error instanceof Error && error.name === 'TokenExpiredError') {
        throw new UnauthorizedException(
          'Token has expired. Please verify OTP again.',
        );
      } else if (error instanceof Error && error.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Invalid token');
      } else {
        throw new UnauthorizedException('Token verification failed');
      }
    }
  }
}
