import { Request, Response, NextFunction } from 'express';
import { Logger } from 'pino';

export function createGlobalErrorHandler(logger: Logger) {
  return function globalErrorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
    logger.error({ err, url: req.url, method: req.method }, 'Unhandled error');
    res.status(500).json({ message: 'Internal Server Error' });
  };
} 