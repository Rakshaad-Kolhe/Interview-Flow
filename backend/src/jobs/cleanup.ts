import cron from 'node-cron';
import prisma from '../db/prisma';

export const initCronJobs = () => {
  // Run every hour at minute 0
  cron.schedule('0 * * * *', async () => {
    console.log('[Cron] Running cleanup job for abandoned interviews...');
    try {
      // Logic: Mark interviews stuck in "created" state for more than 24 hours as "abandoned"
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
      
      const result = await prisma.interview.updateMany({
        where: {
          status: 'created',
          createdAt: {
            lt: yesterday,
          },
        },
        data: {
          status: 'abandoned',
        },
      });

      console.log(`[Cron] Cleanup complete. Marked ${result.count} interviews as abandoned.`);
    } catch (error) {
      console.error('[Cron] Cleanup job failed:', error);
    }
  });

  console.log('[Cron] Scheduled jobs initialized.');
};
