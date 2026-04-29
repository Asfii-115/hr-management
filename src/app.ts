import express, { Application, Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';

import authRoutes from './routes/authRoutes';
import employeeRoutes from './routes/employeeRoutes';
import attendanceRoutes from './routes/attendanceRoutes';
import reportRoutes from './routes/reportRoutes';

dotenv.config();

class App {
  public app: Application;
  private port: number;

  constructor() {
    this.app = express();
    this.port = parseInt(process.env.PORT || '3000');
    this.initMiddlewares();
    this.initRoutes();
    this.initErrorHandler();
  }

  private initMiddlewares(): void {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    const uploadPath = process.env.UPLOAD_PATH || './uploads';
    this.app.use('/uploads', express.static(path.resolve(uploadPath)));
  }

  private initRoutes(): void {
    this.app.get('/', (_req: Request, res: Response) => {
      res.json({ success: true, message: 'HR Management API is running.' });
    });
    this.app.use('/auth', authRoutes);
    this.app.use('/employees', employeeRoutes);
    this.app.use('/attendance', attendanceRoutes);
    this.app.use('/reports', reportRoutes);
    this.app.use((_req: Request, res: Response) => {
      res.status(404).json({ success: false, message: 'Route not found.' });
    });
  }

  private initErrorHandler(): void {
    this.app.use((err: Error, _req: Request, res: Response) => {
      console.error('Unhandled error:', err);
      res.status(500).json({ success: false, message: err.message || 'Internal server error.' });
    });
  }

  public listen(): void {
    this.app.listen(this.port, () => {
      console.log(`✅ HR Management API running at http://localhost:${this.port}`);
    });
  }
}

const application = new App();
application.listen();

export default application.app;