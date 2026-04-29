import { Router } from 'express';
import employeeController from '../controllers/employeeController';
import authMiddleware from '../middleware/authMiddleware';
import uploadMiddleware from '../middleware/uploadMiddleware';

const router = Router();
router.use((req, res, next) => authMiddleware.authenticate(req, res, next));
router.get('/', (req, res) => employeeController.getAll(req, res));
router.get('/:id', (req, res) => employeeController.getById(req, res));
router.post('/', uploadMiddleware.upload.single('photo'), (req, res) => employeeController.create(req, res));
router.put('/:id', uploadMiddleware.upload.single('photo'), (req, res) => employeeController.update(req, res));
router.delete('/:id', (req, res) => employeeController.delete(req, res));
export default router;