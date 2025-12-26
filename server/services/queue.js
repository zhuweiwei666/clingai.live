import Queue from 'bull';

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

// 生成任务队列
export const generateQueue = new Queue('generate', REDIS_URL, {
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: 100,
    removeOnFail: 50,
  },
});

generateQueue.on('error', (error) => {
  console.error('Queue error:', error);
});

generateQueue.on('waiting', (jobId) => {
  console.log(`Job ${jobId} waiting`);
});

generateQueue.on('active', (job) => {
  console.log(`Job ${job.id} started processing`);
});

generateQueue.on('completed', (job, result) => {
  console.log(`Job ${job.id} completed`);
});

generateQueue.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed:`, err.message);
});

// 获取队列状态
export async function getQueueStats() {
  const [waiting, active, completed, failed, delayed] = await Promise.all([
    generateQueue.getWaitingCount(),
    generateQueue.getActiveCount(),
    generateQueue.getCompletedCount(),
    generateQueue.getFailedCount(),
    generateQueue.getDelayedCount(),
  ]);

  return { waiting, active, completed, failed, delayed };
}

export default generateQueue;
