import { Router } from 'express'
import { createEmployee, getEmployeeAttendenceKpi, getEmployeeAttendence, getAllEmployees, getEmployeesByDepartment } from '../controllers/employeeController.js';

const employeeRoutes = Router();

employeeRoutes.get('/', getAllEmployees);
employeeRoutes.post('/', createEmployee)
employeeRoutes.get('/department/:id', getEmployeesByDepartment)
employeeRoutes.get('/attendance/kpi', getEmployeeAttendenceKpi)
employeeRoutes.get('/attendance', getEmployeeAttendence)

export default employeeRoutes;