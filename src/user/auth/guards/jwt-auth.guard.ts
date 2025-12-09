import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from '../../../common/decorators/public.decorator';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

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
    // Try multiple header name variations (API Gateway might normalize headers)
    const authHeader =
      request.headers['authorization'] ||
      request.headers['Authorization'] ||
      request.headers['x-authorization'] ||
      request.headers['X-Authorization'] ||
      (request.headers as any)['x-api-key']; // Some API Gateways use this

    if (!authHeader) {
      return undefined;
    }

    // Handle both string and array cases
    const headerValue = Array.isArray(authHeader) ? authHeader[0] : authHeader;
    
    if (typeof headerValue !== 'string') {
      return undefined;
    }

    // Extract token - handle both "Bearer token" and just "token" formats
    const parts = headerValue.trim().split(' ');
    if (parts.length === 1) {
      // No "Bearer" prefix, assume the whole value is the token
      return parts[0];
    }
    
    const [type, token] = parts;
    return type === 'Bearer' || type === 'bearer' ? token : undefined;
  }
}
