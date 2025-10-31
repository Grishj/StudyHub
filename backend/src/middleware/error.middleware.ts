import { Request, Response, NextFunction } from 'express';
import { sendError } from '@/utils/response.util';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('Error:', err);

  if (err.name === 'JsonWebTokenError') {
    sendError(res, 'Invalid token', 401);
    return;
  }

  if (err.name === 'TokenExpiredError') {
    sendError(res, 'Token expired', 401);
    return;
  }

  if (err.code === 'P2002') {
    sendError(res, 'Resource already exists', 409);
    return;
  }

  sendError(res, err.message || 'Internal server error', err.statusCode || 500);
};

export const notFound = (req: Request, res: Response): void => {
  sendError(res, `Route ${req.originalUrl} not found`, 404);
};