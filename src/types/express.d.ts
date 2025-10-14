declare namespace Express {
  export interface Request {
    user?: {
      id: string;
      phone: string;
      role: string;
      isActive: boolean;
      phoneVerified: boolean;
    };
    tokenData?: {
      sub: string;
      phone: string;
      role: string;
      type: string;
    };
  }
}
