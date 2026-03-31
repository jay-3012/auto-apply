import type { Request, Response, NextFunction } from 'express';
import { AppError } from '#utils/app-error.js';
import { failure } from '#utils/response.js';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  console.error('Error Details:', err);

  if (err instanceof AppError) {
    failure(res, err);
    return;
  }

  const genericError = new AppError('Internal Server Error', 500, 'INTERNAL_ERROR');
  failure(res, genericError);
};
