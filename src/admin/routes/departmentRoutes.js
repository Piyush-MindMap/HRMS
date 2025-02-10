import { Router } from "express";
import { addDepartment, deleteDepartment, departmentHeadCount, getDepartments, updateDepartment } from "../controllers/departmentController.js";
import { validateDepartment } from "../middlewares/departmentMiddleware.js";

const departmentRoutes = Router();

departmentRoutes.get('/', getDepartments);
departmentRoutes.delete('/:id', deleteDepartment);
departmentRoutes.post('/', validateDepartment, addDepartment)
departmentRoutes.patch('/:id', validateDepartment, updateDepartment)

departmentRoutes.get('/headCount', departmentHeadCount)

export default departmentRoutes; 