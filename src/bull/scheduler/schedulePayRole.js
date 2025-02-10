import prisma from '../../config/db.config.js';
import { payrollQueue } from '../jobs/queues/payRoleQueue.js';

const schedulePayroll = async (payPeriodStart, payPeriodEnd) => {
  try {
    const employees = await prisma.employees.findMany({
      where: { IsDeleted: false },
    });

    employees.forEach((employee) => {
      payrollQueue.add({
        employeeId: employee.EmployeeID,
        payPeriodStart,
        payPeriodEnd,
      },{
        repeat: { cron: cronTime, tz: 'Asia/Kolkata' },
        removeOnComplete: true, // Automatically remove completed jobs
        removeOnFail: true,     // Automatically remove failed jobs
      }
    );
    });

    console.log(`Payroll generation scheduled for ${employees.length} employees.`);
  } catch (error) {
    console.error('Error scheduling payroll generation:', error.message);
  }
};

// Example usage (e.g., schedule payroll for the current month)
const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);

schedulePayroll(startOfMonth, endOfMonth);


