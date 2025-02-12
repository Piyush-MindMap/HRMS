import express from "express"
import { approveLeave } from "../controllers/approvalController.js";

const approvalRoutes = express.Router();

approvalRoutes.post('/leave', approveLeave)
approvalRoutes.post('/overtime', )
approvalRoutes.post('/regularisation', )


export default approvalRoutes

