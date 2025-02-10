import express from "express";
import { applyLeave, getLeaveInfo, getUserLeave } from "../controllers/leaveControllers.js";
import { validateLeaveRequest } from "../middlewares/leaveMiddleware.js";
const leaveRoutes = express.Router();

leaveRoutes.get('/', getUserLeave)
leaveRoutes.get('/:id', getLeaveInfo )
leaveRoutes.post('/apply', validateLeaveRequest, applyLeave)

export default leaveRoutes