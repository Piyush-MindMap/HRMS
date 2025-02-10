// src/user/routes/index.js
import express from 'express';
import attendanceRoutes from './attendance.js';
import leaveRoutes from './leaveRequest.js';

const userRoutes = express.Router();

userRoutes.use('/attendance',attendanceRoutes)
userRoutes.use('/leave',leaveRoutes)

export default userRoutes;
