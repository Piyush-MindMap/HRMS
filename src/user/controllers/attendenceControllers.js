import { v4 as uuidv4 } from 'uuid';
import prisma from '../../config/db.config.js';
import { calculateTimeDifference, getTodaysDate, getTodaysTime } from '../../utils/helperFunctions.js';

export const employeeCheckin = async (req, res) => {
    const eid = req.user.eid;
    const today = getTodaysDate();
    const todayIST = new Date(today);
    const idealCheckinTime = 10;

    const checkInTimeIST = new Date(today + 'T' + getTodaysTime());
    const lateCheckIn = checkInTimeIST.getHours() > idealCheckinTime;

    console.log('Check-In Time (IST):', checkInTimeIST);
    console.log('Check-In Date (IST):', todayIST);
    console.log('Late Check-In:', lateCheckIn);

    try {
        const employee = await prisma.attendance.upsert({
            where: {
                EmployeeID_Date: {
                        EmployeeID: eid,
                        Date: todayIST,
                },
                Absent: true
            },
            update: {
                CheckInTime: checkInTimeIST,
                Absent: false,
                LateCheckIn: lateCheckIn
            },
            create: {
                AttendanceID: uuidv4(),
                EmployeeID: eid,
                CheckInTime: checkInTimeIST,
                Date: todayIST,
                Status: 0,
                IsDeleted: false,
                Timestamp: new Date(),
                LateCheckIn: lateCheckIn
            },
        });

        if (employee && employee.EmployeeID === eid && employee.Date.getTime() === todayIST.getTime()) {
            return res.status(200).json({
                status_code: 200,
                message: 'Check-in successful'
            });
        } else {
            return res.status(400).json({
                status_code: 400,
                message: 'Invalid request or mismatch in employee details.',
            });
        }
    } catch (error) {
        console.error('Error during check-in:', error);

        if (error?.code === 'P2025') {
                if(error?.meta?.modelName === 'Attendance'){
                        return res.status(400).json({
                                status_code: 400,
                                message: 'Employee already checked in.',
                            });
                }
            return res.status(404).json({
                status_code: 404,
                message: 'Employee or Attendance record not found.',
            });
        }

        if (error?.code === 'P2023') {
            return res.status(400).json({
                status_code: 400,
                message: 'Invalid input or malformed request.',
            });
        }

        return res.status(500).json({
            status_code: 500,
            message: 'An unexpected error occurred. Please try again later.',
        });
    }
};

export const employeeCheckout = async (req, res) => {
    const eid = req.user.eid;
    const today = getTodaysDate();
    const todayIST = new Date(today);``
    const earlyCheckoutTime = 19; // 7 PM in 24-hour `format`
    const shiftHours = 9*60;
    let overTime = ''
    let timeWorked = ''

    const attendanceRecord = await prisma.attendance.findUnique({
        where: {
            EmployeeID_Date: {
                EmployeeID: eid,
                Date: todayIST,
            },
        },
        select: {
            CheckInTime: true,
        },
    });

    const checkOutTimeIST = new Date(today + 'T' + getTodaysTime());
    const earlyCheckout = checkOutTimeIST.getHours() < earlyCheckoutTime;

    try {
        if (attendanceRecord.CheckInTime) {
            console.log("--->", attendanceRecord.CheckInTime.toISOString().split('T')[1].split('.')[0], checkOutTimeIST.toISOString().split('T')[1].split('.')[0])
            const totalHoursWorked = calculateTimeDifference(attendanceRecord.CheckInTime.toISOString().split('T')[1].split('.')[0], checkOutTimeIST.toISOString().split('T')[1].split('.')[0]);
            console.log("--->", totalHoursWorked)
            timeWorked = `${totalHoursWorked.hours} : ${totalHoursWorked.minutes}`
            const totalMins = totalHoursWorked.hours*60 + totalHoursWorked.minutes
    
            const overTimeMin =  totalMins - shiftHours;
    
            const hrs = parseInt(overTimeMin/60)
            const min = overTimeMin%60
            overTime = `${hrs} : ${(min<0?min*-1:min)}`
            console.log(timeWorked, hrs, min, overTime)
        }
        else{
            throw new Error('Cannot Check-out without Check-in')
        }
         // Calculate the total hours worked

        console.log('Check-Out Time (IST):', checkOutTimeIST);
        console.log('Check-Out Date (IST):', todayIST);
        console.log('Early Check-Out:', earlyCheckout);

        try {
            const employee = await prisma.attendance.update({
                where: {
                    EmployeeID_Date: {
                        EmployeeID: eid,
                        Date: todayIST,
                    },
                    Status: 0
                },
                data: {
                    CheckOutTime: checkOutTimeIST,
                    Status: 1,
                    EarlyCheckOut: earlyCheckout,
                    Overtime: overTime,
                    WorkHours: timeWorked,
                },
            });

        res.status(200).json({
                    status_code: 200,
                    message: 'Check-out successful'
                });

        } catch (error) {
            console.error('Error during check-out:', error);

            if (error?.code === 'P2025') {
                if(error?.meta?.modelName === 'Attendance'){
                    return res.status(400).json({
                            status_code: 400,
                            message: 'Employee already checked out.',
                        });
            }
                return res.status(404).json({
                    status_code: 404,
                    message: 'Employee or Attendance record not found.',
                });
            }

            if (error?.code === 'P2023') {
                return res.status(400).json({
                    status_code: 400,
                    message: 'Invalid input or malformed request.',
                });
            }

            return res.status(500).json({
                status_code: 500,
                message: 'An unexpected error occurred. Please try again later.',
            });
        }
        
    } catch (error) {
        return res.status(500).json({
            status_code: 500,
            message: String(error).split(':')[1].trim(),
        });
    } 
};

export const employeeTodaysAttendance = async (req, res) => {
    const eid = req.user.eid;
    const today = new Date(getTodaysDate());
    try{
        const attendance = await prisma.attendance.findMany({
            where:{
                EmployeeID: eid,
                Date: today
            },
            select:{
                CheckInTime: true,
                CheckOutTime: true,
                Status: true,
                LateCheckIn: true,
                EarlyCheckOut: true,
                Overtime: true,
                WorkHours: true
            }
        });
        if(attendance.length){
            return res.status(200).json({
                status_code: 200,
                message: 'Attendance fetched successfully',
                data: attendance
            });
        }
        return res.status(200).json({
            status_code: 200,
            message: 'Attendance fetched successfully',
            data: []
        });
    }
    catch{
        return res.status(500).json({
            status_code: 500,
            message: 'No attendance record found for today'
        });
    }
}