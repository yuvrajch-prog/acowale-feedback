import { Request, Response, NextFunction } from 'express';
import { verifyAdminToken, AdminPayload } from '../utils/auth';
import { AppError } from './errorHandler';

export interface AuthenticatedRequest extends Request {
  admin?: AdminPayload;
}

export const requireAdminAuth = (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Unauthorized: Admin authentication token required', 401));
  }

  const token = authHeader.split(' ')[1];
  const payload = verifyAdminToken(token);

  if (!payload) {
    return next(new AppError('Unauthorized: Invalid or expired authentication token', 401));
  }

  req.admin = payload;
  next();
};
