
import { v4 as uuidv4 } from 'uuid';
import prisma from '../../config/db.config.js';


// Create JobTitle
export const addJobTitle = async(req, res) => {
  const JobTitleID  =   uuidv4();
  const {
  JobTitle,     
  Description,    
  MinSalary,      
  MaxSalary,     
  DepartmentID,   
  Responsibilities } = req.body
  if(!JobTitle || !MinSalary || !MaxSalary || !DepartmentID ) {
    return res.status(400).json({ status_code: 400, message: "Please provide all required fields." });
  } 

  try {
    const jobTitle = await prisma.jobTitles.create({ 
      data:{
        JobTitleID,
        JobTitle,     
        Description: Description ? Description:null,    
        MinSalary,      
        MaxSalary,     
        DepartmentID,   
        Responsibilities: Responsibilities ? Responsibilities:null
      }
     });
    res.status(201).json(jobTitle);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get All JobTitles
export const getJobTitles = async(req, res) => {
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
          equals: filters[key]
        };
    }
  });

  try {
    const jobTitles = await prisma.jobTitles.findMany({
      where,
      skip,
      take: limitNumber,
      orderBy: { CreatedDate: 'desc' }
    });
    
    const totalJobTitles = await prisma.jobTitles.count({ where });

    res.json({
        status_code: 200,
        data: jobTitles,
        total: totalJobTitles,
        page: pageNumber,
        pageSize: jobTitles.length,
        totalPages: Math.ceil(totalJobTitles / limitNumber)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Update JobTitle
export const edit = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const jobTitle = await prisma.jobTitles.update({
      where: { JobTitleID: id },
      data: { ...data, UpdatedDate: new Date() },
    });

    res.status(200).json(jobTitle);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// // Soft Delete JobTitle
// router.delete("/:id", async (req, res) => {
//   try {
//     const { id } = req.params;

//     const jobTitle = await prisma.jobTitles.update({
//       where: { JobTitleID: id },
//       data: { IsDeleted: true },
//     });

//     res.status(200).json({ message: "JobTitle soft deleted", jobTitle });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });


