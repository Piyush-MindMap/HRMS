import express from "express"
import { addJobTitle, getJobTitles } from "../controllers/jobTitleController.js";
import { validateJobTitle } from "../middlewares/jobTitleMiddleware.js";

const jobRoleRoutes = express.Router();

jobRoleRoutes.get('/', getJobTitles)
jobRoleRoutes.post('/', validateJobTitle, addJobTitle)

export default jobRoleRoutes

