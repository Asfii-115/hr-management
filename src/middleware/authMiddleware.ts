import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { DecodedToken } from '../types/express';

class AuthMiddleware {
  public authenticate(req: Request, res: Response, next: NextFunction): void {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ success: false, message: 'No token provided. Access denied.' });
      return;
    }

    const token = authHeader.split(' ')[1];

    try {
      const secret = process.env.JWT_SECRET;
      if (!secret) throw new Error('JWT_SECRET not configured');

      const decoded = jwt.verify(token, secret) as DecodedToken;
      req.user = { id: decoded.id, email: decoded.email, name: decoded.name };
      next();
    } catch {
      res.status(401).json({ success: false, message: 'Invalid or expired token.' });
    }
  }
}

export default new AuthMiddleware();