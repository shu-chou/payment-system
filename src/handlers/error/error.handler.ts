import { Request, Response, NextFunction } from 'express';
import { Logger } from 'pino';

export class ApiError extends Error {
  statusCode: number;
  details?: any;

  constructor(statusCode: number, message: string, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

export function createApiErrorHandler(logger: Logger) {
  return function apiErrorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
    if (err instanceof ApiError) {
      logger.error({ err, url: req.url, method: req.method }, 'API error');
      return res.status(err.statusCode).json({
        message: err.message,
        ...(err.details && { details: err.details }),
      });
    }
    next(err);
  };
} 