import {Router} from 'express';
import { addLocation, deleteLocation,  getLocations, updateLocation } from '../controllers/locationController.js';
import { validateLocation } from '../middlewares/locationMiddlewares.js';

const locationRoutes = Router();

locationRoutes.get('/', getLocations)
locationRoutes.delete('/:id', deleteLocation)
locationRoutes.post('/',validateLocation ,addLocation)
locationRoutes.patch('/:id',validateLocation ,updateLocation)

export default locationRoutes;
