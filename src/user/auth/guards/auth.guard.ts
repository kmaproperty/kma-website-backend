import * as jwt from 'jsonwebtoken';
import { Observable } from 'rxjs';
import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { User } from '../../entities/user.entity';
import { USER_MESSAGES } from 'src/user/constants/user.messages';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  private readonly logger = new Logger(AuthGuard.name);

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    return this.validateRequest(request);
  }

  async validateRequest(request: any): Promise<boolean> {
    const token = request.headers?.authorization?.replace('Bearer ', '');

    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      const accessToken = await this.verifyAccessToken(token);

      if (!accessToken) {
        throw new HttpException(
          USER_MESSAGES.AUTH.INVALID_TOKEN,
          HttpStatus.UNAUTHORIZED,
        );
      }

      const user = await this.userRepo.findOne({
        where: {
          id: accessToken?.sub,
          deletedAt: IsNull(),
        },
      });

      if (!user || !user.token || user.token !== token) {
        throw new HttpException(
          USER_MESSAGES.AUTH.INVALID_TOKEN,
          HttpStatus.UNAUTHORIZED,
        );
      }

      request.user = user;
      //    request.user = token;
      return true;
    } catch (error) {
      this.logger.log(error);
      throw new HttpException(error.message, HttpStatus.UNAUTHORIZED);
    }
  }

  private verifyAccessToken(token: string): any {
    const secret = process.env.ACCESS_TOKEN_SECRET;
    if (!secret) {
      this.logger.error(
        'ACCESS_TOKEN_SECRET environment variable is not defined',
      );
      throw new HttpException(
        'Server configuration error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return jwt.verify(token, secret);
  }
}
