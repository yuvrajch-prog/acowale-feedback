import { Router } from 'express';
import { adminLoginHandler, getAdminProfileHandler } from '../controllers/auth.controller';

const router = Router();

router.post('/login', adminLoginHandler);
router.get('/me', getAdminProfileHandler);

export default router;
