// payrollWorker.js
import prisma from '../../../config/db.config.js'
import { calculateNetPay, calculateOvertimePay, getCompensationDetails, getOvertimeHours } from '../../../utils/helperFunctions';

export const generatePayroll = async (employeeId, payPeriodStart, payPeriodEnd) => {
  try {
    const compensation = await getCompensationDetails(employeeId, prisma);

    if (!compensation) {
      throw new Error(`Compensation details not found for employee ID: ${employeeId}`);
    }

    const overtimeHours = await getOvertimeHours(employeeId, payPeriodStart, payPeriodEnd, prisma);

    const overtimePay = calculateOvertimePay(overtimeHours, compensation.OvertimeRate || 0);

    const grossPay = compensation.GrossPay + overtimePay;

    const deductions = (compensation.ProfessionalTax || 0) + (compensation.IncomeTax || 0) + (compensation.ESI || 0);

    const netPay = calculateNetPay(grossPay, deductions);

    const payroll = await prisma.payroll.create({
      data: {
        EmployeeID: employeeId,
        PayPeriodStart: payPeriodStart,
        PayPeriodEnd: payPeriodEnd,
        GrossPay: grossPay,
        BasicPay: compensation.BasicPay,
        HRA: compensation.HRA,
        Incentive: compensation.Incentive,
        OvertimeHours: overtimeHours,
        OvertimePay: overtimePay,
        NetPay: netPay,
        PaymentDate: new Date(),
        PaymentMethod: 'NEFT',
        Currency: 'INR',
        EmployeeTaxCode: compensation.EmployeeTaxCode,
        PaymentStatus: 'Pending',
        IsDeleted: false,
      },
    });

    return payroll;
  } catch (error) {
    console.error(`Error generating payroll for employee ${employeeId}:`, error.message);
    throw error;
  }
};
