import prisma from "../../config/db.config.js";
import { v4 as uuidv4 } from 'uuid';

export const getLocations = async (req, res) => {
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
    
    console.log(where);

    try {
        const locations = await prisma.location.findMany({
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

export const deleteLocation = async (req, res)=> {
    try {
        const id = req.params.id;
        await prisma.location.update({
            where: {LocationID: id, IsDeleted:false },
            data: { IsDeleted: true }
        });
        res.json({ status_code: 200, message: "Location deleted successfully." });
    } catch (error) {
        if(error?.code==='P2025'){
            return res.status(404).json({ status_code: 404, message: "Location not found." });
        }
        if(error?.code==='P2023'){
            return res.status(400).json({ status_code: 400, message: "Invalid request." });
        }
        res.status(500).json({ status_code: 500, message: "An unexpected error occurred.", error });
    }
}

export const addLocation = async (req, res) => {
    try {
        const { Name, Address, City, State, Country, TimeZone, ContactNumber } = req.body;
        if(!Name || !Address || !City || !State || !Country || !TimeZone) {
            return res.status(400).json({ status_code: 400, message: "Please provide all required fields." });
        }
        
        const nameExists = await prisma.location.findFirst({
            where: {
                LocationName: name
            }
        });
        if(nameExists) {
            return res.status(400).json({ status_code: 400, message: "Location name already exists." });
        }

        const locationExists = await prisma.location.findFirst({
            where: {
                Address: address, AND: { City: city, AND: { State: state, AND: { Country: country } } }
            }
          });   
          if(locationExists) {
            return res.status(400).json({ status_code: 400, message: "Location already exists." });
          }


        const location = await prisma.location.create({
            data: {
                LocationID: uuidv4(),
                LocationName: Name,
                Address,
                City,
                State,
                Country,
                TimeZone,
                ContactNumber: ContactNumber ? ContactNumber : null,
            }
        });
        res.json({ status_code: 200, data: location });
    } catch (error) {
        res.status(500).json({ status_code: 500, message: "An unexpected error occurred." });
    }
}

export const updateLocation = async (req, res) => {
    try {
        const id = req.params.id;
        const data = req.body;
        const keys = Object.keys(data);

        if( req.user.role !== 'Super Admin' &&
            keys.includes('CreatedDate') ||
            keys.includes('LocationID') ||
            keys.includes('Id') 
        ){
            return res.status(403).json({ status_code: 403, message: "Forbidden" });
        }

        if (Object.keys(data).length === 0) {
            return res.status(400).json({ status_code: 400, message: "Please provide at least one field to update." });
        }

        const location = await prisma.location.update({
             where: { LocationID: id , IsDeleted: false},
            data
        });

        res.json({ status_code: 200, data: location });
    } catch (error) {
        if(error?.code==='P2025'){
            return res.status(404).json({ status_code: 404, message: "Location not found." });
        }
        if(error?.code==='P2023'){
            return res.status(400).json({ status_code: 400, message: "Invalid request." });
        }
        res.status(500).json({ status_code: 500,message: "An unexpected error occurred." });
    }
}


