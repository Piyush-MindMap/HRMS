import prisma from "../config/db.config.js";

export const getTodaysDate = () => {
    const now = new Date(); // Current UTC time
    const istOffset = 5.5 * 60 * 60 * 1000; // IST offset in milliseconds (5 hours 30 minutes)
    const istDate = new Date(now.getTime() + istOffset); // Add the offset to the current UTC time
    return new Date(istDate).toISOString().split('T')[0]; // Returns the date part only (YYYY-MM-DD)
}

export const getTodaysTime = () => {
    const now = new Date(); // Current UTC time
    const istOffset = 5.5 * 60 * 60 * 1000; // IST offset in milliseconds (5 hours 30 minutes)
    const istDate = new Date(now.getTime() + istOffset); // Add the offset to the current UTC time
    return new Date(istDate).toISOString().split('T')[1]; // Returns the date part only (YYYY-MM-DD)
}

export const getYesturdaysDate = () => {
    const now = new Date(); // Current UTC time
    const istOffset = 5.5 * 60 * 60 * 1000; // IST offset in milliseconds (5 hours 30 minutes)
    const istDate = new Date(now.getTime() + istOffset); // Add the offset to the current UTC time
    const yesterdayDate = new Date(istDate);
    yesterdayDate.setDate(istDate.getDate() - 1); // Subtract 1 day to get yesterday
    return new Date(yesterdayDate).toISOString().split('T')[0]; // Returns the date part only (YYYY-MM-DD)
}

export const get2daysBackDate = () => {
  const now = new Date(); // Current UTC time
  const istOffset = 5.5 * 60 * 60 * 1000; // IST offset in milliseconds (5 hours 30 minutes)
  const istDate = new Date(now.getTime() + istOffset); // Add the offset to the current UTC time
  const yesterdayDate = new Date(istDate);
  yesterdayDate.setDate(istDate.getDate() - 2); // Subtract 2 day to get yesterday
  return new Date(yesterdayDate).toISOString().split('T')[0]; // Returns the date part only (YYYY-MM-DD)
}

export const getISTDate = (date) => {
    const now = new Date(date); // Current UTC time
    const istOffset = 5.5 * 60 * 60 * 1000; // IST offset in milliseconds (5 hours 30 minutes)
    const istDate = new Date(now.getTime() + istOffset); // Add the offset to the current UTC time
    return new Date(istDate).toISOString().split('T')[0]; // Returns the date part only (YYYY-MM-DD)
}

export const calculateTimeDifference = (time1, time2) => {
    // Parse time inputs, treating them as time-only by appending a fixed date
    const date1 = new Date(`1970-01-01T${time1}Z`);
    const date2 = new Date(`1970-01-01T${time2}Z`);
  
    // Ensure valid Date objects
    if (isNaN(date1.getTime()) || isNaN(date2.getTime())) {
      throw new Error('Invalid time inputs. Provide valid time strings in HH:MM:SS format.');
    }
  
    // Calculate the absolute difference in milliseconds
    const differenceInMs = Math.abs(date2 - date1);
  
    // Convert milliseconds to hours and minutes
    const differenceInMinutes = Math.floor(differenceInMs / (1000 * 60));
    const differenceInHours = Math.floor(differenceInMinutes / 60);
  
    // Return the results as hours and minutes
    return {
      hours: differenceInHours,
      minutes: differenceInMinutes % 60,
    };
  };

export const calculateOvertimePay = (overtimeHours, overtimeRate) => {
  return overtimeHours * overtimeRate;
};

export const calculateNetPay = (grossPay, deductions) => {
  return grossPay - deductions;
};

export const getOvertimeHours = async (employeeId, payPeriodStart, payPeriodEnd, prismaInstance) => {
  const overtimeData = await prismaInstance.overtimeRequest.findMany({
    where: {
      employeeId,
      approved: true,
      date: { gte: payPeriodStart, lte: payPeriodEnd },
    },
  });

  return overtimeData.reduce((acc, data) => acc + data.hoursWorked, 0);
};


export const getCompensationDetails = async (employeeId, prismaInstance) => {
  return prismaInstance.compensation.findUnique({
    where: { EmployeeID: employeeId },
  });
};

