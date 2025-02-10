import prisma from "../../config/db.config.js";
import { v4 as uuidv4 } from 'uuid';

export const getDepartments = async (req, res) => {
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
      const locations = await prisma.departments.findMany({
          where,
          skip,
          take: limitNumber,
          orderBy: { CreatedDate: 'desc' }
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

export const deleteDepartment = async (req, res)=> {
  try {
      const id = req.params.id;
       await prisma.departments.update({
          where: {DepartmentID: id, IsDeleted: false},
          data: { IsDeleted : true }
      });
      res.json({ status_code: 200, message: "Department deleted successfully." });
  } catch (error) {
    if(error?.code==='P2025'){
        return res.status(404).json({ status_code: 404, message: "Department not found." });
    }
    if(error?.code==='P2023'){
        return res.status(400).json({ status_code: 400, message: "Invalid request." });
    }
      res.status(500).json({ status_code: 500, message: "An unexpected error occurred." });
  }
}

export const addDepartment = async (req, res) => {
  try {
      const { Name, LocationID, HodId, Budget, Description } = req.body;
      if(!Name || !LocationID || !Budget || !Description ) {
          return res.status(400).json({ status_code: 400, message: "Please provide all required fields." });
      } 
      HodId?console.log(HodId):console.log(false);


      const locationExists = await prisma.location.findFirst({
          where: {
              LocationID
          }
      });
      if(!locationExists) {
        return res.status(400).json({ status_code: 400, message: "Location does not exist." });
      }

      if(HodId){
        const hodExists = await prisma.employees.findFirst({
            where: {
                EmployeeID: HodId
            }
        });
        if(!hodExists) {
            return res.status(400).json({ status_code: 400, message: "Employee does not exist." });
        }
      }

      const nameExists = await prisma.departments.findFirst({
        where: {
            DepartmentName: Name
        }
      });

      if(nameExists) {
        return res.status(400).json({ status_code: 400, message: "Department already exists." });
      }
      else{
        const department = await prisma.departments.create({
            data: {
                DepartmentID: uuidv4(),
                DepartmentName: Name,
                LocationID,
                HODID: HodId? HodId : null,
                Budget,
                Description: Description? Description : null,
            }
        });
        res.json({ status_code: 200, data: department });
      }
  } catch (error){
    if(error?.code==='P2023'){
        return res.status(400).json({ status_code: 400, message: "Invalid request." });
    }
      res.status(500).json({ status_code: 500, message: "An unexpected error occurred." ,error});
  }
}

export const updateDepartment = async (req, res) => {
    try {
        const id = req.params.id;
        let data = req.body;
        let dpName = data['Name'];
        data['DepartmentName'] = dpName;
        delete data['Name']

        const keys = Object.keys(data);

        console.log('-------========-----------', data)


        if( req.user.role !== 'Super Admin' &&
            keys.includes('CreatedDate') ||
            keys.includes('DepartmentID') ||
            keys.includes('Id')
        ){
            return res.status(403).json({ status_code: 403, message: "Forbidden" });
        }

        if (Object.keys(data).length === 0) {
            return res.status(400).json({ status_code: 400, message: "Please provide at least one field to update." });
        }


       if(keys.includes('HodId')){
            const hodExists = await prisma.employees.findFirst({
                where: {
                EmployeeID: HodId
            }
            });
            if(!hodExists) {
                return res.status(400).json({ status_code: 400, message: "Employee does not exist." });
            }
        }


        const department = await prisma.departments.update({
            where: { DepartmentID: id , IsDeleted: false },
            data
        });

        res.json({ status_code: 200, data: department });
    } catch (error) {
        if(error?.code==='P2025'){
            return res.status(404).json({ status_code: 404, message: "Department not found." });
        }
        if(error?.code==='P2023'){
            return res.status(400).json({ status_code: 400, message: "Invalid request." });
        }
        res.status(500).json({ status_code: 500, message: "An unexpected error occurred." });
    }
}

export const departmentHeadCount = async (req, res) => {
    const headCount = await prisma.departments.aggregate({
        _sum:{
            HeadCount:true
        },
        where:{
            IsDeleted:false
        }
    })
    console.log(headCount)
    res.json({status_code:200, data:headCount._sum})
}
