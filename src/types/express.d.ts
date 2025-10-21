import { UserRole } from '../user/enum/user-role.enum';

declare global {
  namespace Express {
    export interface Request {
      user?: {
        id: string;
        phone: string;
        role: UserRole;
        isActive: boolean;
        phoneVerified: boolean;
      };
      tokenData?: {
        sub: string;
        phone: string;
        role: UserRole;
        type: 'access_token' | 'refresh_token';
      };
    }
  }
}

export {};
