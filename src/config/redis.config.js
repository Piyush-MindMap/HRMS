import { config } from 'dotenv';

config();

const redisConfig = {
  host: process.env.REDIS_URL,
  port: process.REDIS_PORT,
};


export { redisConfig };
