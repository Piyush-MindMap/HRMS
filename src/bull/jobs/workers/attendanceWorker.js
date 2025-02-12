import { Worker } from 'bullmq';
import { redisConfig } from '../../../config/redis.config.js';
import prisma from '../../../config/db.config.js';

const attendanceWorker = new Worker(
  'attendance-queue',
  async (job) => {
    const { date } = job.data;
    console.log(`Processing attendance generation for date: ${date}`);

    const targetDate = new Date(date);

    // Prevent processing old jobs
    const today = new Date();
    const maxAllowedDaysAgo = 2; // Allow jobs from today or the last 2 days
    const daysAgo = Math.floor((today - targetDate) / (1000 * 60 * 60 * 24));

    if (daysAgo > maxAllowedDaysAgo) {
      console.log(`Skipping old job for ${date}, as it is older than ${maxAllowedDaysAgo} days.`);
      return;
    }

    // Fetch all employees
    const employees = await prisma.employees.findMany({ where: { IsDeleted: false } });

    // Fetch holidays for the target date
    const holidays = await prisma.holidays.findMany({ where: { HolidayDate: targetDate, IsDeleted: false } });
    const isPublicHoliday = holidays.some((holiday) => holiday.LocationID === null);
    const holidayLocationIds = holidays.map((holiday) => holiday.LocationID);

    // Determine if the target date is a weekend
    const isWeekend = [0, 6].includes(targetDate.getDay()); // Sunday (0) or Saturday (6)

    // Fetch approved leave requests for the target date
    const leaveRequests = await prisma.leaveRequests.findMany({
      where: {
        StartDate: { lte: targetDate },
        EndDate: { gte: targetDate },
        Status: 1,
        IsDeleted: false,
      },
    });

    // Map employees to attendance data
    const attendanceData = await Promise.all(
      employees.map(async (employee) => {
        const employeeOnLeave = leaveRequests.some((leave) => leave.EmployeeID === employee.EmployeeID);

        // Check if the employee's location matches a department-specific holiday
        let isDepartmentHoliday = false;
        if (!isPublicHoliday && holidayLocationIds.length) {
          const jobRole = await prisma.jobTitles.findUnique({ where: { JobRoleID: employee.JobRoleID } });
          const department = await prisma.departments.findUnique({ where: { DepartmentID: jobRole?.DepartmentID } });
          isDepartmentHoliday = holidayLocationIds.includes(department?.Id);
        }

        // Determine attendance status
        const status = isWeekend || isPublicHoliday || isDepartmentHoliday || employeeOnLeave ? 1 : 0;

        return {
          AttendanceID: crypto.randomUUID(),
          EmployeeID: employee.EmployeeID,
          Date: targetDate,
          Status: status,
          IsDeleted: false,
          Timestamp: new Date(),
        };
      })
    );

    // Insert attendance rows into the database
    await prisma.attendance.createMany({ data: attendanceData });
    console.log(`Attendance records added for ${attendanceData.length} employees on ${date}`);
  },
  {
    connection: redisConfig,
  }
);

attendanceWorker.on('failed', (job, err) => {
  console.error(`Job failed for ${job.id}:`, err);
});

attendanceWorker.on('completed', (job) => {
  console.log(`Job ${job.id} completed successfully.`);
});
