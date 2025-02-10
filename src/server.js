import 'dotenv/config';
import http from 'http';
import app from './app.js';
import { fileURLToPath } from "url";
import { recoverMissedAttendanceJobs } from './utils/recoverMissedJobs.js';
import './bull/jobs/workers/attendanceWorker.js';
import './bull/scheduler/scheduleAttendance.js';
import { handleUncaughtErrors } from './utils/errorHandlers.js';

export const HTTP_PORT = process.env.HTTP_PORT || 3000;
export const server = http.createServer(app);


export const fileDir = fileURLToPath(import.meta.url);



handleUncaughtErrors()


server.listen(HTTP_PORT, async () => {
  console.log(`Server is running on http://localhost:${HTTP_PORT}`);

  try {
     await recoverMissedAttendanceJobs();
  } catch (error) {
    console.error('Error recovering missed jobs:', error);
  } 
});

