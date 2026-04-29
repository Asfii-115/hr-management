import { Router } from 'express';
import reportController from '../controllers/reportController';
import authMiddleware from '../middleware/authMiddleware';

const router = Router();
router.use((req, res, next) => authMiddleware.authenticate(req, res, next));
router.get('/attendance', (req, res) => reportController.monthlyAttendance(req, res));
export default router;