import { attendanceQueue } from '../bull/jobs/queues/attendanceQueue.js';
import prisma from '../config/db.config.js';
import { get2daysBackDate, getTodaysDate, getYesturdaysDate } from './helperFunctions.js';

export async function recoverMissedAttendanceJobs() {
  const today = new Date(getTodaysDate());
  const yesterday = new Date(getYesturdaysDate());
  const twoDaysAgo = get2daysBackDate(); // Restrict backfilling to the last two days
  const counts = await attendanceQueue.getJobCounts();
  console.log('Recovering missed attendance jobs...',counts);
  const delayedJobs = await attendanceQueue.getDelayed();
console.log('Delayed Jobs:', delayedJobs.map(job => ({
  id: job.id,
  name: job.name,
  data: job.data,
  delay: job.opts.delay,
})));

  // Check for yesterday's attendance
  const yesterdayAttendanceExists = await prisma.attendance.findMany({
    where: { Date: yesterday, IsDeleted: false },
  });

  if (yesterdayAttendanceExists.length === 0 && yesterday >= twoDaysAgo) {
    console.log(`Missed attendance job detected for ${yesterday}. Adding to queue.`);
    await attendanceQueue.add(
      'generate-attendance',
      { date: yesterday },
      {
        removeOnComplete: true,
        removeOnFail: true,
      }
    );
  }

  // Check for today's attendance
  const todayAttendanceExists = await prisma.attendance.findMany({
    where: { Date: today, IsDeleted: false },
  });

  if (todayAttendanceExists.length === 0) {
    console.log(`Missed attendance job detected for today (${today}). Adding to queue.`);
    await attendanceQueue.add(
      'generate-attendance',
      { date: today },
      {
        removeOnComplete: true,
        removeOnFail: true,
      }
    );
  }
}
