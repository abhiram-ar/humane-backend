import { createClient } from 'redis';

export const redisClient = createClient({ url: 'redis://feed-redis-srv:6379' }).on('error', (err) =>
   console.log('Redis Client Error', err)
);
export const connectRedis = async () => {
   await redisClient.connect();
};

export const disconnectRedis = () => {
   redisClient.destroy();
};
