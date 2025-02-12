import { Router } from 'express'
import { createEmployee, getEmployeeAttendenceKpi, getEmployeeAttendence, getAllEmployees, getEmployeesByDepartment, getAllLeaveRequests, getLeaveRequestKpi } from '../controllers/employeeController.js';

const employeeRoutes = Router();

employeeRoutes.get('/', getAllEmployees);
employeeRoutes.post('/', createEmployee)

employeeRoutes.get('/department/:id', getEmployeesByDepartment)

employeeRoutes.get('/attendance', getEmployeeAttendence)
employeeRoutes.get('/attendance/kpi', getEmployeeAttendenceKpi)

employeeRoutes.get('/requests', getAllLeaveRequests)
employeeRoutes.get('/requests/kpi', getLeaveRequestKpi)

export default employeeRoutes;