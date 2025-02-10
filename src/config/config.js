import { config } from 'dotenv';

config();

export const port = process.env.PORT || 5000;
export const jwtSecret = process.env.JWT_SECRET;
