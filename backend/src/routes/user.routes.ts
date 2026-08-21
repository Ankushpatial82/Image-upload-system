import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { authenticateJWT } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateJWT);

router.put('/profile', userController.updateProfile);
router.delete('/account', userController.deleteAccount);

export default router;
