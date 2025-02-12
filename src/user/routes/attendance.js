import express from "express";
import { employeeCheckin, employeeCheckout, employeeTodaysAttendance } from "../controllers/attendenceControllers.js";

const attendanceRoutes = express.Router();

attendanceRoutes.get('/checkin', employeeCheckin)
attendanceRoutes.get('/checkout', employeeCheckout)
attendanceRoutes.get('/', employeeTodaysAttendance)

export default attendanceRoutes