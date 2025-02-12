// src/admin/routes/index.js
import express from 'express';
import departmentRoutes from './departmentRoutes.js';
import locationRoutes from './locationRouters.js';
import employeeRoutes from './employeeRoutes.js';
import jobRoleRoutes from './jobTitleRoutes.js';
import approvalRoutes from './approvalRoutes.js';

const adminRoutes = express.Router();

adminRoutes.use('/departments', departmentRoutes)
adminRoutes.use('/locations', locationRoutes)
adminRoutes.use('/employees', employeeRoutes)
adminRoutes.use('/jobTitles', jobRoleRoutes)
adminRoutes.use('/approvals', approvalRoutes)

export default adminRoutes;
