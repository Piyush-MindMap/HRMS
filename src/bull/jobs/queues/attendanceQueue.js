import { Queue } from 'bullmq';
import { redisConfig } from '../../../config/redis.config.js';

const attendanceQueue = new Queue('attendance-queue', {
  connection: redisConfig,
});


export { attendanceQueue };
