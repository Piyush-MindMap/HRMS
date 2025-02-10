import { v4 as uuidv4 } from "uuid";
import prisma from "../../config/db.config.js";
import { sendRealTimeNotification } from "../../utils/socketFuncitons.js";

export const getUserLeave = async (req, res) => {
    try {
      const { eid } = req.user; // Assuming `eid` is available in the authenticated user's payload
      const employeeData = await prisma.employees.findUnique({
        where: {
          EmployeeID: eid,
        },
        select: {
          JobTitle: {
            select: {
              Department: {
                select: {
                  LocationID: true,
                },
              },
            },
          },
        },
      });
      
      if (!employeeData || !employeeData.JobTitle?.Department?.LocationID) {
        return res.status(404).json({
          status_code: 404,
          message: "Location ID not found for the employee.",
        });
      }
      
      const employeeLocationID = employeeData.JobTitle.Department.LocationID;
      
  
      // Step 4: Fetch leave requests for the employee
      const leaves = await prisma.leaveRequests.findMany({
        where: {
          EmployeeID: eid,
          IsDeleted: false,
        },
        orderBy: {
          CreatedDate: "desc",
        },
      });
  
      // Step 5: Fetch holidays for the employee's location
      const holidays = await prisma.holidays.findMany({
        where: {
          OR: [
            { LocationID: null }, 
            { LocationID: employeeLocationID }, 
          ],
        },
        orderBy: {
         HolidayDate: "asc",
        },
      });
  
      // Combine leave requests and holidays
      const combinedData = {
        leaves,
        holidays,
      };
  
      res.status(200).json({
        status_code: 200,
        message: "Leave requests and holidays retrieved successfully.",
        data: combinedData,
      });
    } catch (error) {
      console.error("Error fetching leave requests and holidays:", error);
      res.status(500).json({
        status_code: 500,
        message: "An error occurred while fetching leave requests and holidays.",
      });
    }
  };
 
export const getLeaveInfo = async (req, res) => {
  try {
    const { id } = req.params;

    const leave = await prisma.leaveRequests.findUnique({
      where: {
        LeaveRequestID: id,
      },
    });

    if (!leave || leave.IsDeleted) {
      return res.status(404).json({
        status_code: 404,
        message: "Leave request not found.",
      });
    }

    res.status(200).json({
      status_code: 200,
      message: "Leave request retrieved successfully.",
      data: leave,
    });
  } catch (error) {
    console.error("Error fetching leave request details:", error);
    res.status(500).json({
      status_code: 500,
      message: "An error occurred while fetching the leave request.",
    });
  }
};

export const applyLeave = async (req, res) => {
  try {
    const eid = req.user.eid; 
    const { LeaveType, StartDate, EndDate, Count, Comments, Attachment } = req.body;

    if (!LeaveType || !StartDate || !EndDate || !Count) {
      return res.status(400).json({
        status_code: 400,
        message: "Required fields are missing.",
      });
    }

    const employee = await prisma.employees.findUnique({
      where: {
        EmployeeID: eid,
      },
      select: {
        ManagerID: true, 
        HrID: true
      },
    });

    if (!employee) {
      return res.status(404).json({
        status_code: 404,
        message: "Employee not found.",
      });
    }

    const managerID = employee.ManagerID || "1"; // Default to "1" if no manager is found
    const hrID = employee.HrID || null; // Leave as null if no HR is found

    const leaveRequest = await prisma.leaveRequests.create({
      data: {
        LeaveRequestID: uuidv4(),
        EmployeeID: eid,
        LeaveType,
        StartDate: new Date(StartDate),
        EndDate: new Date(EndDate),
        Count,
        Comments,
        Attachment,
        CreatedDate: new Date(),
        Level1ApproverID: managerID, // Assign the Manager or default to "1"
        Level2ApproverID: hrID, // Assign the HR or leave as null
      },
    });

    if(hrID){
      const HrNotice = await prisma.notifications.create({
        data: {
          NotificationID : uuidv4(),
          UserID  : hrID,
          Message: Comments,    
          RelatedEntityID  : eid,
          NotificationType : "Leave"
        }
      })
      sendRealTimeNotification(hrID, notHrNoticeice.Message)
    }
    if(managerID){
      const managerNotice = await prisma.notifications.create({
        data: {
          NotificationID : uuidv4(),
          UserID  : managerID,
          Message: Comments,    
          RelatedEntityID  : eid,
          NotificationType : "Leave"
        }
      })
      sendRealTimeNotification(managerID, managerNotice.Message)
    }
    
    res.status(201).json({
      status_code: 201,
      message: "Leave request submitted successfully.",
      data: leaveRequest,
    });
  } catch (error) {
    console.error("Error applying for leave:", error);
    res.status(500).json({
      status_code: 500,
      message: "An error occurred while applying for leave.",
    });
  }
};


