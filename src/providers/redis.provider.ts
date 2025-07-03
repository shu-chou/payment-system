import Redis from 'ioredis';
import { config } from '../configs/env.config';

const redis = new Redis({
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password || undefined,
  db: config.redis.db,
  // Add more options as needed for production
});

export { redis }; 