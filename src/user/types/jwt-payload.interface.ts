/**
 * JWT Payload Interfaces for type-safe token handling
 */

export interface JwtPayload {
  sub: string;
  phone: string;
  role: string;
  type: 'access_token' | 'refresh_token';
  iat?: number;
  exp?: number;
}

export interface AccessTokenPayload extends JwtPayload {
  type: 'access_token';
}

export interface RefreshTokenPayload extends JwtPayload {
  type: 'refresh_token';
}
