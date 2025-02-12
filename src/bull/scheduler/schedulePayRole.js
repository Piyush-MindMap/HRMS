import prisma from '../../config/db.config.js';
import { payrollQueue } from '../jobs/queues/payRoleQueue.js';

 async function() {
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
        repeat: { cron: ' * * * 30 * *', tz: 'Asia/Kolkata' },
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