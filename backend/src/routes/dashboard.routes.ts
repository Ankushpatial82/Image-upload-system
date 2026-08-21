import { Router } from 'express';
import * as dashboardController from '../controllers/dashboard.controller';
import { authenticateJWT } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateJWT);

router.get('/stats', dashboardController.getDashboardStats);

export default router;
