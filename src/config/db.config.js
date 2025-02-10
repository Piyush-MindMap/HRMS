import { PrismaClient } from '@prisma/client';
import logger from '../middleware/requestLogger.js'; 

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'], // Enable Prisma logs
});

// Map Prisma log events to Winston
prisma.$on('query', (e) => {
  logger.info(`Prisma Query: ${e.query} | Params: ${e.params}`);
});

prisma.$on('info', (e) => {
  logger.info(`Prisma Info: ${e.message}`);
});

prisma.$on('warn', (e) => {
  logger.warn(`Prisma Warning: ${e.message}`);
});

prisma.$on('error', (e) => {
  logger.error(`Prisma Error: ${e.message}`);
});

export default prisma;
