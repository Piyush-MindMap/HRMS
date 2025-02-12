import express from "express";
import { applyLeave, approveLeaveByManager, getLeaveInfo, getUserLeave } from "../controllers/leaveControllers.js";
import { validateLeaveRequest } from "../middlewares/leaveMiddleware.js";
const leaveRoutes = express.Router();

leaveRoutes.get('/', getUserLeave)
leaveRoutes.get('/:id', getLeaveInfo )
leaveRoutes.post('/apply', validateLeaveRequest, applyLeave)
leaveRoutes.post('/approve', approveLeaveByManager)

export default leaveRoutes