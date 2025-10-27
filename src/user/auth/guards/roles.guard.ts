import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { User } from '../../entities/user.entity';
import { USER_MESSAGES } from '../../constants/user.messages';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const request = context.switchToHttp().getRequest();

      //get current user from current context
      const currentUser: User = request.user;

      // get project role of current request
      const userRoles: string[] = this.reflector.get(
        'USER_ROLES',
        context.getHandler(),
      );

      //check current request role match with  user role
      if (
        !currentUser ||
        (userRoles?.length && !userRoles?.includes(currentUser.role))
      ) {
        throw new HttpException(
          USER_MESSAGES.AUTH.ACCESS_DENIED,
          HttpStatus.FORBIDDEN,
        );
      }
      return true;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStatus = error.status || HttpStatus.UNAUTHORIZED;

      this.logger.error(`Role guard failed: ${errorMessage}`);

      throw new HttpException(errorMessage, errorStatus);
    }
  }
}
