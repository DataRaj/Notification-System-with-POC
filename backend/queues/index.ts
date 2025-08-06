// queues/index.js
import { Worker } from 'bullmq';

export async function initializeQueues(redis, notificationService) {
  const notificationWorker = new Worker(
    'notifications',
    async (job) => {
      console.log(`Processing notification job: ${job.id}`);
      console.log('Job data:', JSON.stringify(job.data));
      
      try {
        await notificationService.processNotification(job.data);
        console.log(`Notification job completed: ${job.id}`);
      } catch (error) {
        console.error(`Notification job failed: ${job.id}`, error);
        throw error;
      }
    },
    {
      connection: redis,
      concurrency: 10, // Process up to 10 jobs concurrently
      removeOnComplete: { count: 100 },
      removeOnFail: {count: 50},
      stalledInterval: 1000,
    }
  );

  // Worker event handlers
  notificationWorker.on('active', (job) => {
    console.log(`Notification worker activated for job: ${job.id}`);
  });

  notificationWorker.on('completed', (job) => {
    console.log(`Notification job completed: ${job.id}`);
  });

  notificationWorker.on('failed', (job, error) => {
    console.error(`Notification job failed: ${job.id}`, error);
  });

  notificationWorker.on('error', (error) => {
    console.error('Notification worker error:', error);
  });

  notificationWorker.on('drained', () => {
    console.log('Notification worker drained - no more jobs to process');
  });

  notificationWorker.on('closing', () => {
    console.log('Notification worker is closing');
  });

  notificationWorker.on('closed', () => {
    console.log('Notification worker has closed');
  });

  notificationWorker.on('paused', () => {
    console.log('Notification worker is paused');
  });

  notificationWorker.on('resumed', () => {
    console.log('Notification worker has resumed');
  });

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    console.log('Shutting down workers...');
    await notificationWorker.close();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    console.log('Shutting down workers...');
    await notificationWorker.close();
    process.exit(0);
  });

  return {
    notificationWorker
  };
}