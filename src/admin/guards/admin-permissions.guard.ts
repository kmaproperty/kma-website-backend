import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ADMIN_PERMISSIONS_KEY } from '../decorators/admin-permissions.decorator';
import { AdminRole } from '../enum/admin-role.enum';
import { AdminRepository } from '../repositories/admin.repository';

@Injectable()
export class AdminPermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly adminRepository: AdminRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions =
      this.reflector.getAllAndOverride<string[]>(ADMIN_PERMISSIONS_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) || [];

    if (!requiredPermissions.length) {
      return true;
    }

    const req = context.switchToHttp().getRequest();
    const admin = req.admin as { id: string } | undefined;
    if (!admin) {
      throw new UnauthorizedException('Admin context missing');
    }

    const adminRecord = await this.adminRepository.findById(admin.id);
    if (!adminRecord) {
      throw new UnauthorizedException('Admin not found');
    }

    if (adminRecord.role === AdminRole.SUPER_ADMIN) {
      return true;
    }

    const adminPerms = new Set(adminRecord.permissions || []);
    const hasAll = requiredPermissions.every((p) => adminPerms.has(p));
    if (!hasAll) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}


