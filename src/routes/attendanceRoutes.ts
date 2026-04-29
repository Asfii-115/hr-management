import { Router } from 'express';
import attendanceController from '../controllers/attendanceController';
import authMiddleware from '../middleware/authMiddleware';

const router = Router();
router.use((req, res, next) => authMiddleware.authenticate(req, res, next));
router.get('/', (req, res) => attendanceController.getAll(req, res));
router.get('/:id', (req, res) => attendanceController.getById(req, res));
router.post('/', (req, res) => attendanceController.create(req, res));
router.put('/:id', (req, res) => attendanceController.update(req, res));
router.delete('/:id', (req, res) => attendanceController.delete(req, res));
export default router;