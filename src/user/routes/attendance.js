import express from "express";
import { employeeCheckin, employeeCheckout } from "../controllers/attendenceControllers.js";

const attendanceRoutes = express.Router();

attendanceRoutes.get('/checkin', employeeCheckin)
attendanceRoutes.get('/checkout', employeeCheckout)

export default attendanceRoutes