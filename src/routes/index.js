
import { Router } from 'express';
import adminRoutes from '../admin/routes/index.js'; // Ensure the .js extension
import authRoutes from './authRoute.js';
import authenticate from '../middleware/authenticate.js';
import userRoutes from '../user/routes/index.js';

const allRoutes = Router();


allRoutes.use('/auth', authRoutes)
allRoutes.use('/admin', authenticate ,adminRoutes);
allRoutes.use('/user', authenticate, userRoutes)

export default allRoutes;
