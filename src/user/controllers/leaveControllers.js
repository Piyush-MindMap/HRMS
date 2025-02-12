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
        HrID: true,
        SecondaryManagerID: true, 
      },
    });

    if (!employee) {
      return res.status(404).json({
        status_code: 404,
        message: "Employee not found.",
      });
    }

    const managerID = employee.ManagerID || "1"; 
    const secondaryManagerID = employee.SecondaryManagerID || null; 
    const hrID = employee.HrID || null; 

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
        Level1ApproverID: managerID, 
        Level2ApproverID: secondaryManagerID || hrID,
        Level3ApproverID: secondaryManagerID ? hrID : null,
      },
    });

    if (hrID) {
      const hrNotice = await prisma.notifications.create({
        data: {
          NotificationID: uuidv4(),
          UserID: hrID,
          Message: Comments,
          RelatedEntityID: eid,
          NotificationType: "Leave",
        },
      });
      sendRealTimeNotification(hrID, hrNotice);
    }

    // Send notification to Manager
    if (managerID) {
      const managerNotice = await prisma.notifications.create({
        data: {
          NotificationID: uuidv4(),
          UserID: managerID,
          Message: Comments,
          RelatedEntityID: eid,
          NotificationType: "Leave",
        },
      });
      sendRealTimeNotification(managerID, managerNotice);
    }

    if (secondaryManagerID) {
      const secondaryManagerNotice = await prisma.notifications.create({
        data: {
          NotificationID: uuidv4(),
          UserID: secondaryManagerID,
          Message: Comments,
          RelatedEntityID: eid,
          NotificationType: "Leave",
        },
      });
      sendRealTimeNotification(secondaryManagerID, secondaryManagerNotice);
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

export const approveLeaveByManager = async (req, res) => {
  const { id, status, message } = req.body;
  const eid = req.user.eid;
  console.log("---->>>>>",eid, id, status, message)
  try {
      const leave = await prisma.leaveRequests.findUnique({
          where:{
              LeaveRequestID : id
          },
          select:{
              Level1ApproverID: true,
              Level1ApprovalStatus:true,
              Level2ApproverID:true,
              Level2ApprovalStatus:true,
          }
      })

      console.log("->>>>>", leave.Level1ApproverID, leave.Level2ApproverID)

    if(leave.Level1ApproverID !== String(eid) &&  leave.Level2ApproverID !== String(eid) ){
      return res.status(401).json({ status_code: 401, message: "UnAuthorised." });
    }

    if(leave.Level1ApproverID !== String(eid)  && leave.Level1ApprovalStatus !== 1 ){
      return res.status(400).json({ status_code: 400, message: "Leave request is not approved by all approvers." });
    }

    
  } catch (error) {
      console.log("---->>>>>",eid, id, status, message)
      return res.status(404).json({ status_code: 404, message: "Leave request not found.", error });
  }  


      
  try {
      await prisma.leave.update({
      where: { LeaveRequestID: id },
      data: data
      });
      res.json({ status_code: 200, message: "Leave approved successfully." });
  } catch (error) {
      console.error("Error approving leave:", error);
      res.status(500).json({
      status_code: 500,
      message: "An unexpected error occurred.",
      });
  }
};


