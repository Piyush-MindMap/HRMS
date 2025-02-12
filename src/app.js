import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import multer from 'multer';


// Import middleware and routes
import { notFound, serverError } from './middleware/errorHandler.js';
import { loggerMiddleware } from './middleware/requestLogger.js';
import allRoutes from './routes/index.js'; // Your main routes file

// Rate limiter configuration
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // Limit each IP to 100 requests per windowMs
});


const upload = multer({
  storage: multer.memoryStorage(), // Or your desired storage
  limits: {
    fieldSize: 10 * 1024 * 1024, // Increase to 10 MB (adjust as needed)
  },
});



// Create the Express app
const app = express();



// Middleware
app.use(upload.any());
app.use(compression());
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(limiter);
app.use(loggerMiddleware);

// Routes
app.use('/api/v1', allRoutes);

// // Error handling middleware
// app.use(notFound);
app.use(serverError);

export default app;
