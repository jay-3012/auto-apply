import type { Response } from 'express';
import type { AppError } from '#utils/app-error.js';

export const success = <T>(res: Response, data: T, status = 200): void => {
  res.status(status).json({ success: true, data });
};

export const failure = (res: Response, error: AppError): void => {
  res.status(error.statusCode).json({
    success: false,
    error: { code: error.code, message: error.message },
  });
};
