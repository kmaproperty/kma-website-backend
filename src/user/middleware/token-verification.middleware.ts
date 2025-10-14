import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class TokenVerificationMiddleware implements NestMiddleware {
  constructor(private readonly jwtService: JwtService) {}

  use(req: Request, res: Response, next: NextFunction) {
    try {
      console.log('Authorization header:', req.headers.authorization);

      // Try to extract token from Authorization header first
      const token = req.headers?.authorization?.split(' ')[1];

      if (!token) {
        console.log('No token found in header or body');
        throw new UnauthorizedException('Token is required');
      }

      // Verify JWT token
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
      const decodedToken = this.jwtService.verify(token) as {
        sub: string;
        phone: string;
        role: string;
        type: string;
      };

      // Validate token type
      if (decodedToken.type !== 'access_token') {
        throw new UnauthorizedException('Invalid token type');
      }

      // Populate token data in request
      req.tokenData = {
        sub: decodedToken.sub,
        phone: decodedToken.phone,
        role: decodedToken.role,
        type: decodedToken.type,
      };

      next();
    } catch (error) {
      console.log(error);
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
