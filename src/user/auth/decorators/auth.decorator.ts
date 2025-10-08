import { SetMetadata, UseGuards, applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { RolesGuard } from '../guards/roles.guard';

export function Auth(...roles: string[]) {
  const role = roles.length ? roles.join(' | ') : 'ALL';
  return applyDecorators(
    SetMetadata('USER_ROLES', roles),
    UseGuards(AuthGuard, RolesGuard),
    ApiBearerAuth(),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
    ApiForbiddenResponse({
      description: 'This api can be accessed by: ' + role,
    }),
  );
}
