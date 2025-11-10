import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Authorization token missing');
    }

    try {
      const secret =
        this.configService.get<string>('JWT_SECRET') || 'fallback-secret-key';
      const payload = await this.jwtService.verifyAsync(token, { secret });

      if (!payload) {
        throw new UnauthorizedException('Invalid token payload');
      }

      if (payload.type === 'admin_access_token') {
        if (!payload.sub || !payload.username) {
          throw new UnauthorizedException('Invalid admin token');
        }
        (request as any).admin = {
          id: payload.sub,
          username: payload.username,
        };
        return true;
      }

      if (!payload.sub || !payload.phone) {
        throw new UnauthorizedException('Invalid user token');
      }

      (request as any).user = {
        id: payload.sub,
        phone: payload.phone,
        role: payload.role,
        isActive: payload.isActive ?? true,
        phoneVerified: payload.phoneVerified ?? true,
      };

      (request as any).tokenData = {
        sub: payload.sub,
        phone: payload.phone,
        role: payload.role,
        type: payload.type,
      };

      return true;
    } catch (error) {
      throw new UnauthorizedException(error.message || 'Invalid token');
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const authHeader =
      request.headers['authorization'] ||
      request.headers['Authorization'];

    if (!authHeader || typeof authHeader !== 'string') {
      return undefined;
    }

    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' ? token : undefined;
  }
}
