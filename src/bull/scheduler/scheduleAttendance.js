import prisma from '../../config/db.config.js';
import { getTodaysDate } from '../../utils/helperFunctions.js';
import { attendanceQueue } from '../jobs/queues/attendanceQueue.js';

async function scheduleAttendanceJob() {
  const cronTime = '15 10 * * 1-5'; // Run only on weekdays (Monday to Friday)

  console.log('Checking for existing attendance records...');

  const existingRecord = await checkAttendanceRecord(getTodaysDate());
  if (existingRecord) {
    console.log('Attendance record already exists for today. Skipping job scheduling.');
    return;
  }

  console.log('Scheduling daily attendance job...');
  await attendanceQueue.add(
    'generate-attendance',
    { date: new Date(getTodaysDate()) },
    {
      repeat: { cron: cronTime, tz: 'Asia/Kolkata' },
      removeOnComplete: true, // Automatically remove completed jobs
      removeOnFail: true,     // Automatically remove failed jobs
    }
  );
  console.log('Scheduled');

  async function checkAttendanceRecord(date) {
    const lastAttendanceRecord = await prisma.attendance.findFirst({
      orderBy: { Date: 'desc' },
    });

    if (lastAttendanceRecord) {
      const lastRecordDate = lastAttendanceRecord.Date.toISOString().split('T')[0];
      return lastRecordDate === date;
    }
    return false;
  }
}

scheduleAttendanceJob().catch((err) => {
  console.error('Failed to schedule attendance job:', err);
});
