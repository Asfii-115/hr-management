import { JwtPayload } from 'jsonwebtoken';

export interface AuthUser {
  id: number;
  email: string;
  name: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export interface DecodedToken extends JwtPayload {
  id: number;
  email: string;
  name: string;
}