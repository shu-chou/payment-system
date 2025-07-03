import pino from 'pino';
import { config } from '../configs/env.config';

const logger = pino({
  level: config.logLevel,
});

export { logger }; 