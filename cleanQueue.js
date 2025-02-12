import { attendanceQueue } from './src/bull/jobs/queues/attendanceQueue.js';

(async () => {
  try {
    // Clean up completed and failed jobs
    await attendanceQueue.clean(0, 1000, 'completed'); // 0 ms age (immediate), limit 1000
    await attendanceQueue.clean(0, 1000, 'failed');    // 0 ms age (immediate), limit 1000

    // Drain the queue to remove waiting, delayed, and active jobs
    await attendanceQueue.drain();

    // Remove delayed jobs
    const delayedJobs = await attendanceQueue.getDelayed();
    for (const job of delayedJobs) {
      await job.remove();
    }

    console.log('Queue cleaned successfully.');
  } catch (error) {
    console.error('Error cleaning queue:', error);
  } finally {
    const counts = await attendanceQueue.getJobCounts();
    console.log('Recovering missed attendance jobs...', counts);
    const delayedJobs = await attendanceQueue.getDelayed();
    console.log('Delayed Jobs:', delayedJobs.map(job => ({
      id: job.id,
      name: job.name,
      data: job.data,
      delay: job.opts.delay,
    })));
    await attendanceQueue.close();
  }
})();