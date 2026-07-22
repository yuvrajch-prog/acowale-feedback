import { Router } from 'express';
import { healthCheckHandler } from '../controllers/health.controller';

const router = Router();

router.get('/', healthCheckHandler);

export default router;
