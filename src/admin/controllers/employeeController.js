import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import prisma from "../../config/db.config.js";
import path, { dirname } from "path";
import fs from 'fs';
import { fileDir } from "../../server.js";
import { getTodaysDate } from '../../utils/helperFunctions.js';

export const getAllEmployees = async (req, res) => {
    const { page = 1, limit = 10, ...filters } = req.query;
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    if (isNaN(pageNumber) || isNaN(limitNumber) || pageNumber <= 0 || limitNumber <= 0) {
        return res.status(400).json({ status_code: 400, message: "Invalid page or limit values." });
    }

    const skip = (pageNumber - 1) * limitNumber;
    const where = {};

    Object.keys(filters).forEach(key => {
        if (filters[key] === 'false' || filters[key] === 'true') {
            where[key] = filters[key] === 'true';
        } else {
            where[key] = {
                contains: filters[key]
            };
        }
    });

    try {
        const locations = await prisma.employees.findMany({
            where,
            skip,
            take: limitNumber,
            orderBy: { Timestamp: 'desc' } 
        });

        const totalLocations = await prisma.location.count({ where });

        res.json({
            status_code: 200,
            data: locations,
            total: totalLocations,
            page: pageNumber,
            pageSize: locations.length,
            totalPages: Math.ceil(totalLocations / limitNumber)
        });
    } catch (error) {
        console.error("Error fetching locations:", error);
        res.status(500).json({
            status_code: 500,
            message: "An unexpected error occurred.",
        });
    }
};

export const getEmployeesByDepartment = async (req, res) => {
  const deptId = req.params.id;
  const jobRoles = await prisma.jobTitles.findMany({
    select:{
      JobTitleID: true
    },
    where:{
      DepartmentID:{
        equals:deptId
      }
    }
  })

  const jobTitles = jobRoles.map((ele)=>ele.JobTitleID)
  const employees = await prisma.employees.findMany({
    where: {
      JobTitleID: {
        in: jobTitles
      }
    }
  });

   console.log('fsd', employees)

  res.status(200).json({
    status_code: 200,
    data: employees
  });
}

export const createEmployee = async (req, res) => {
    const allData = req.body;
    console.log("--", allData)
    const passwordHash = await bcrypt.hash("Password@123", 5);
    const writtenFiles = [];
    try {
        const result = await prisma.$transaction(async (transaction) => {
     
          const employee = await transaction.employees.create({
            data:{
              Uuid : uuidv4(),
              Picture : allData.picture? allData.picture:null,
              FirstName : allData.firstName,
              LastName : allData.lastName,
              Email : allData.professionalEmail,
              Phone : allData?.professionalPhone ? allData?.professionalPhone : null,
              HireDate : allData.hireDate,
              //JobTitleID : allData.jobTitleId,
              JobTitle: {
                connect: { JobTitleID: allData.jobTitleId }, // Replace with the actual JobTitle ID
              },
              Role : parseInt(allData.Role,10),
              ManagerName : allData?.managerName ? allData?.managerName : null ,
              ManagerID : allData?.managerId ?allData?.managerId : null ,
              SecondaryManagerName : allData?.secondaryManagerName  ? allData?.secondaryManagerName : null,
              SecondaryManagerID : allData?.secondaryManagerId ? allData?.secondaryManagerId : null ,
              HrName : allData?.hrName ? allData?.hrName : null ,
              HrID : allData?.hrId ? allData?.hrId : null
            }
        })

        await transaction.userAccounts.create({
            data:{
                EmployeeID: employee.EmployeeID,
                Email : employee.Email,
                UserID : uuidv4(),
                Username : employee.FirstName,
                Role: allData.role,
                PasswordHash : passwordHash
            }
        })

        await transaction.workSchedules.create({
            data:{
                ScheduleID: uuidv4(),
                Employee:{
                  connect: { EmployeeID: employee.EmployeeID}
                },
                StartTime: allData.startTime,
                EndTime: allData.endTime,
                DaysOfWeek: parseInt(allData.daysOfWeek,10),
                Location: allData.location,

            }
        })

        await transaction.employeeDetails.create({
            data:{
                DetailID: uuidv4(),
                Employees:{
                  connect: { EmployeeID: employee.EmployeeID}
                },
                PersonalEmail: allData.personalEmail,
                PersonalPhone: allData.personalPhone ,
                EmergencyContactName : allData.emergencyContactName,
                EmergencyContactPhone : parseInt(allData.emergencyContactPhone,10),
                EmergencyContactRelaiton : allData.emergencyContactRelation,
                BloodGroup : allData.bloodGroup,
                DOB : allData.dob,
                Gender : allData.gender,
                CurrentAddress : allData.currentAddress,
                PermanentAddress : allData.permanentAddress,
                Experience : allData?.exp ? JSON.parse(allData?.exp) : null,
                Skills : allData?.skills ? allData?.skills : null,
                HealthRecord : allData?.healthRecord ? allData?.healthRecord : null,
                Description : allData?.aboutMe ? allData?.aboutMe : null
            }
        })

        await transaction.bankAccounts.create({
            data:{
                BankAccountID : uuidv4(),
                Employees:{
                  connect: { EmployeeID: employee.EmployeeID}
                },
                Name: allData.bankName,
                BankAccountNumber : allData.bankAccountNumber,
                IFSCNumber : allData.ifsc,
                Branch: allData.bankBranch
            }
        })

        await transaction.compensation.create({
            data:{
                CompensationID : uuidv4(),
                Employees:{
                  connect: { EmployeeID: employee.EmployeeID}
                },
                CTC : (parseInt(allData.basicPay,10)+parseInt(allData?.allowances,10)+parseInt(allData?.incentive,10)+parseInt(allData?.bonus,10)) * 12,
                GrossPay : parseInt(allData.basicPay,10)+parseInt(allData?.allowances,10)+parseInt(allData?.incentive,10)+parseInt(allData?.bonus,10),
                BasicPay : parseInt(allData.basicPay,10),
                HRA : parseInt(allData.hra),
                //Allowances : allData?.allowances ? JSON.parse(allData?.allowances): null,
                Allowances : allData?.allowances ? allData?.allowances: null,
                Incentive : allData?.incentive ? parseInt(allData?.incentive,10) : null,
                Bonus : allData?.bonus ? parseInt(allData?.bonus,10) : null,
                OvertimeRate : allData?.overtimeRate ? parseInt(allData?.overtimeRate,10) : null, 
                ProfessionalTax : allData?.professionalTax ? parseInt(allData?.professionalTax,10) : null, 
                TaxRegime : 1,
                ESI : allData.esi ? parseInt(allData.esi,10) : null,
                //OtherDeductions : allData.otherDeductions ? JSON.parse(allData.otherDeductions) : null,
                OtherDeductions : allData.otherDeductions ? parseInt(allData.otherDeductions) : null,
                NetPay : parseInt(allData.basicPay,10)+parseInt(allData?.allowances,10)+parseInt(allData?.incentive,10)+parseInt(allData?.bonus,10) - parseInt(allData?.professionalTax,10)-parseInt(allData.otherDeductions) - parseInt(allData.esi,10)
            }
        })

        
      
     
  const documents = [...JSON.parse(allData.documents), ...JSON.parse(allData.education)];
  console.log("<->", documents);
  const filePromises = documents.map((doc, index) => {
    const base64Data = doc.attachment.split(",")[1];
    const fileBuffer = Buffer.from(base64Data, "base64");
    const __filename = fileDir
    console.log(__filename)
    const __dirname = dirname(__filename);
    const dirPath = path.join(__dirname, "documents", employee.EmployeeID);
    const fileName = `${index}-${doc.name.replace(/[^a-zA-Z0-9-_\.]/g, "_")}.pdf`;
    const filePath = path.join(dirPath, fileName);

    // Create directory if it doesn't exist
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    // Write the file and store its details
    return fs.promises.writeFile(filePath, fileBuffer).then(() => {
      writtenFiles.push({ filePath, doc });
    });
  });

  // Wait for all files to be written
  await Promise.all(filePromises);

  // Add files to the database in a single transaction
  for (const { filePath, doc } of writtenFiles) {
    const addedDoc = await transaction.employeeDocuments.create({
      data: {
        Employees:{
          connect: { EmployeeID: employee.EmployeeID}
        },
        DocumentID: uuidv4(),
        Name: doc.name,
        ReferenceNumber: doc?.referenceNumber || doc?.score,
        Attachment: filePath,
      },
    });

    // Save education if applicable
    if (doc?.institutionName && doc?.institutionName.length) {
      await transaction.employeeEducation.create({
        data: {
          EmployeeEducationID: uuidv4(),
          Employees:{
            connect: { EmployeeID: employee.EmployeeID}
          },
          Name: doc.name,
          Score: doc.score,
          InstitutionName: doc.institutionName,
          Specialization: doc.specialization,
          CompletionDate: doc.completionDate,
          EmployeeDocument:{
            connect: {DocumentID : addedDoc.DocumentID},
          }
        },
      });
    }
  }

  return employee;
    });

    res.status(201).json({ status_code: 200,  message:'Employee Created', data: result });
    } catch (error) {
    console.error('Error creating employee:', error);
    for (const filePath of writtenFiles) {
        try {
          await fs.promises.unlink(filePath);
        } catch (unlinkError) {
          console.error(`Failed to delete file ${filePath}:`, unlinkError);
        }
      }
      if(error?.code==='P2002'){
        res.status(400).json({status_code: 400,  message:'Employee Already Created' });
      }
    res.status(500).json({ status_code: 500, message: 'Failed to create employee' });
  }
}

export const getEmployeeAttendenceKpi = async (req, res) => {
  const allEmployees = await prisma.attendance.findMany({
    where:{
      Date:new Date(getTodaysDate())
    }
  });

  const kpi = { checkIn: 0, checkOut:0, yetToCheckIn:0, present: 0, leave: 0, total:allEmployees.length}
  allEmployees.forEach((emp)=>{
    if(emp.CheckInTime){
      kpi.checkIn+=1;
      kpi.present+=1;
    }
    if(emp.CheckOutTime){
      kpi.checkOut+=1;
    }
    if(!emp.CheckInTime){
      if(!emp.Status){
        kpi.yetToCheckIn+=1;
      }else{
        kpi.leave+=1;
      }
    }
  })

  console.log(kpi)
  res.status(200).json({status_code:200, data:kpi})
}

export const getEmployeeAttendence = async (req, res) => {
  const { page = 1, limit = 10, ...filters } = req.query;
  const pageNumber = parseInt(page, 10);
  const limitNumber = parseInt(limit, 10);
  const onLeave = filters?.leave
  const yetToCheckIn = filters?.yet

  const skip = (pageNumber - 1) * limitNumber;
  const where = {
    Date: new Date(getTodaysDate())
  };

  if(onLeave){
    where['Status'] = 1
  }

  if(yetToCheckIn==='0'){
    where['CheckInTime'] = null
  }
  
  if(yetToCheckIn==='1'){
    where['CheckInTime'] = {
      not: null
    }
  }

  const attendence = await prisma.attendance.findMany({
    where,
    skip,
    take: limitNumber,
    orderBy: { Timestamp: 'desc' } 
  })
  const attendenceWithNames = await Promise.all(attendence.map(async (record) => {
    const employee = await prisma.employees.findUnique({
      where: { EmployeeID: record.EmployeeID },
      select: { FirstName: true, LastName: true }
    });
    return {
      ...record,
      FirstName: employee?.FirstName || '',
      LastName: employee?.LastName || ''
    };
  }));

  const attendenceCount = await prisma.attendance.count({ where });

  res.json({
    status_code: 200,
    data: attendenceWithNames,
    total: attendenceCount,
    page: pageNumber,
    pageSize: attendence.length,
    totalPages: Math.ceil(attendenceCount / limitNumber)
});
}

export const getAllLeaveRequests = async (req, res) => {
  const { page = 1, limit = 10, ...filters } = req.query;
  const pageNumber = parseInt(page, 10);
  const limitNumber = parseInt(limit, 10);
  const status = filters?.status;

  const skip = (pageNumber - 1) * limitNumber;
  const where = {};

  if (status) {
    where['Status'] = parseInt(status, 10);
  }

  where['Level3ApproverID'] = req.user.eid;

  const leaveRequests = await prisma.leaveRequests.findMany({
    where,
    skip,
    take: limitNumber,
    orderBy: { Timestamp: 'desc' } 
  });

  const leaveRequestsWithNames = await Promise.all(leaveRequests.map(async (record) => {
    const employee = await prisma.employees.findUnique({
      where: { EmployeeID: record.EmployeeID },
      select: { FirstName: true, LastName: true }
    });
    return {
      ...record,
      FirstName: employee?.FirstName || '',
      LastName: employee?.LastName || ''
    };
  }));

  const leaveRequestsCount = await prisma.leaveRequests.count({ where });

  res.json({
    status_code: 200,
    data: leaveRequestsWithNames,
    total: leaveRequestsCount,
    page: pageNumber,
    pageSize: leaveRequests.length,
    totalPages: Math.ceil(leaveRequestsCount / limitNumber)
  });
}

export const getLeaveRequestKpi = async (req, res) => {
  const allLeaveRequests = await prisma.leaveRequests.findMany(
    {
      where:{
        Level3ApproverID: req.user.eid
      }
    }
  );

  const kpi = {pending:0, approved:0, rejected:0, total:allLeaveRequests.length}
  allLeaveRequests.forEach((leave)=>{
    if(leave.Status===0){
      kpi.pending+=1;
    }
    if(leave.Status===1){
      kpi.approved+=1;
    }
    if(leave.Status===2){
      kpi.rejected+=1;
    }
  })

  res.status(200).json({status_code:200, data:kpi})
}
