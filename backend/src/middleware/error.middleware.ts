import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';
import { sendError } from '../utils/response';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled Error:', err);

  const statusCode = err.statusCode || 500;
  const message = env.NODE_ENV === 'production' && statusCode === 500
    ? 'Internal server error occurred. Please try again later.'
    : err.message || 'An unexpected error occurred.';

  return sendError(res, message, statusCode);
};
