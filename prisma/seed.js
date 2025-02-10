import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { hash } from 'bcrypt';
import { getISTDate } from '../src/utils/helperFunctions.js';
const prisma = new PrismaClient();


  // Create a Head HR Employee
  const hashedPassword = await hash("password123", 10);
  const locaitonID = '10455e36-3bd0-41aa-8a2b-739f29d956d5';
  const departmentID = '40fe5b36-8bd0-49aa-8a3b-739f89d956d5';
  const jobTitleID = '08b8cbb4-e1e2-41e9-8807-c19945012644';
  const employeeID = 'E2';


const roles = [
  {
    Id: 1,
    RoleName: "Super Admin",
    Permissions: "Full access to all features and settings",
  },
  {
    Id: 2,
    RoleName: "Head Hr",
    Permissions: "Full access to all features and settings",
  },
  {
    Id: 3,
    RoleName: "Hr",
    Permissions: "Restricted access to some features and settings",
  },
  {
    Id: 4,
    RoleName: "Employee",
    Permissions: "Restricted access to all features and settings",
  },
];

const holidays = [
  {
    HolidayID: "40fe4b36-8bd0-49aa-8b3b-739f89d956d5",
    HolidayName: 'Republic Day',
    HolidayDate: getISTDate('2025-01-26'),
  },
  {
    HolidayID:"40fe4b36-8bd0-49aa-8b3b-739f82d936d5",
    HolidayName: 'Independence Day',
    HolidayDate: getISTDate('2025-08-15'),
  },
  {
    HolidayID: "40fe4b36-8bd0-49aa-8b3b-712f82d936e5",
    HolidayName: 'Gandhi Jayanti',
    HolidayDate: getISTDate('2025-10-2'),
  },
  {
    HolidayID: "40fe5b36-7bd0-49aa-8b3b-729f82d936d5",
    HolidayName: 'Testing',
    HolidayDate: getISTDate('2025-1-27'),
  }
];

async function main() {
  // Upsert roles
  for (const role of roles) {
    await prisma.roles.upsert({
      where: {
        Id: role.Id, // Use the role's unique `id`
      },
      update: {}, // No update needed, as we're only upserting if it doesn't exist
      create: {
        Id: role.Id, // Make sure to include the `id`
        RoleName: role.RoleName,
        Permissions: role.Permissions,
      },
    });
  }
  console.log("Roles upserted");



  const location = await prisma.location.upsert({
    where: { LocationID: locaitonID },
    update: {},
    create: {
      LocationID: locaitonID,
      LocationName: "Human Resources",
      Address: "123 Main St",
      City: "Noida",
      State: "Uttar Pradesh",
      Country: "India",
      TimeZone: "IST",
      ContactNumber: "1234567890",
    },
  });
  // Create or upsert a department
  const department = await prisma.departments.upsert({
    where: { DepartmentID: departmentID },
    update: {},
    create: {
      DepartmentID: departmentID,
      DepartmentName: "Human Resources",
      HODID: employeeID,
      LocationID: locaitonID,
      Budget: 500000,
      CreatedDate: new Date(),
      Status: true,
      Description: "Handles all employee-related processes and policies.",
    },
  });

  // Create or upsert a job title
  const jobTitle = await prisma.jobTitles.upsert({
    where: { JobTitleID: jobTitleID },
    update: {},
    create: {
      JobTitleID: jobTitleID,
      JobTitle: "Head HR",
      Description: "Responsible for managing the HR department and overseeing HR activities.",
      MinSalary: 200000,
      MaxSalary: 800000,
      DepartmentID: departmentID,
      CreatedDate: new Date(),
      Status: true,
    },
  });

  // Create or upsert an employee
  const employee = await prisma.employees.upsert({
    where: {EmployeeID: "3" },
    update: {},
    create: {
      Uuid: uuidv4(),
      FirstName: "John",
      LastName: "Doe",
      Email: "headhr@example.com",
      Phone: "1234567890",
      HireDate: new Date(),
      JobTitleID: jobTitleID,
      Role: 2, // Role ID for Head HR
      ManagerName: "John Doe",
      ManagerID:employeeID,
      HrName: "John Doe",
      HrID: employeeID,
      Status: true,
    },
  });

  // Create or upsert a user account
  const userAccount = await prisma.userAccounts.upsert({
    where: { Email: "headhr@example.com" },
    update: {},
    create: {
      Email: "headhr@example.com",
      EmployeeID: employee.EmployeeID,
      UserID: uuidv4(),
      Username: "John Doe",
      PasswordHash: hashedPassword,
      Role: "Head HR",
      CreatedDate: new Date(),
    },
  });

  console.log("Head HR data seeded successfully");

  console.log('Seeding public holidays...');
  for (const holiday of holidays) {
    console.log(holiday.HolidayDate)
    await prisma.holidays.upsert({
      where: { HolidayID: holiday.HolidayID },
      update: {},
      create: {
        HolidayID: holiday.HolidayID,
        DepartmentID: holiday.DepartmentID,
        HolidayName: holiday.HolidayName,
        HolidayDate: new Date(holiday.HolidayDate),
        CreatedDate: new Date(),
        UpdatedDate: new Date(),
      },
    });
  }
  console.log('Public holidays seeded successfully.');

}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
