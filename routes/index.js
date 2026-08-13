import express from 'express';

import AuthRoutes from './authRoutes.js';
import UserRoutes from './userRoutes.js';

const router = express.Router();

router.use('/auth', AuthRoutes);
router.use('/user', UserRoutes);

export default router