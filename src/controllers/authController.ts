import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../config/knex';
import { loginSchema } from '../validators/authValidator';

interface HrUser {
  id: number;
  email: string;
  password_hash: string;
  name: string;
}

interface LoginRequestBody {
  email: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: { id: number; email: string; name: string };
}

class AuthController {
  public async login(req: Request<object, LoginResponse, LoginRequestBody>, res: Response<LoginResponse>): Promise<void> {
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      res.status(400).json({ success: false, message: error.details[0].message });
      return;
    }

    const { email, password } = value as LoginRequestBody;

    try {
      const user = await db<HrUser>('hr_users').where({ email }).first();
      if (!user) {
        res.status(401).json({ success: false, message: 'Invalid email or password.' });
        return;
      }

      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        res.status(401).json({ success: false, message: 'Invalid email or password.' });
        return;
      }

      const secret = process.env.JWT_SECRET;
      if (!secret) throw new Error('JWT_SECRET not configured.');

      const token = jwt.sign(
        { id: user.id, email: user.email, name: user.name },
        secret,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' },
      );

      res.status(200).json({
        success: true,
        message: 'Login successful.',
        token,
        user: { id: user.id, email: user.email, name: user.name },
      });
    } catch (err) {
      console.error('Login error:', err);
      res.status(500).json({ success: false, message: 'Internal server error.' });
    }
  }
}

export default new AuthController();