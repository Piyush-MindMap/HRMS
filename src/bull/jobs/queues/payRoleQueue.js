// payrollQueue.js
const Queue = require('bull');

const payrollQueue = new Queue('payroll-queue', {
    connection: redisConfig,
  });
  
  export { payrollQueue };
