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
    // Check if route is marked as public (check handler first, then class)
    const handlerPublic = this.reflector.get<boolean>(
      IS_PUBLIC_KEY,
      context.getHandler(),
    );
    const classPublic = this.reflector.get<boolean>(
      IS_PUBLIC_KEY,
      context.getClass(),
    );
    const isPublic = handlerPublic ?? classPublic ?? false;

    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    // For public routes, allow access without authentication
    // But try to authenticate if token is present (for optional auth)
    if (isPublic) {
      // If token is present, try to authenticate (but don't fail if invalid)
      if (token) {
        try {
          await this.authenticateToken(request, token);
        } catch (error) {
          // If token is invalid or expired, just continue without authentication
          // This allows unauthenticated access to public routes
          // User will be treated as unauthenticated
        }
      }
      // Always allow access to public routes
      return true;
    }

    // For protected routes, token is required
    if (!token) {
      throw new UnauthorizedException('Authorization token missing');
    }

    return this.authenticateToken(request, token);
  }

  private async authenticateToken(request: Request, token: string): Promise<boolean> {
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
