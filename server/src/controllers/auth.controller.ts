import { Request, Response, NextFunction } from 'express';
import { prisma } from '../db/client';
import { createAdminToken, verifyAdminToken } from '../utils/auth';
import { AppError } from '../middleware/errorHandler';

export const adminLoginHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError('Please provide both email and password', 400);
    }

    const cleanEmail = email.toLowerCase().trim();

    // Query User table in database
    const adminUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!adminUser) {
      throw new AppError('Invalid admin email or password', 401);
    }

    if (adminUser.role !== 'ADMIN') {
      throw new AppError('Access denied: User does not have ADMIN privileges', 403);
    }

    if (adminUser.password !== password) {
      throw new AppError('Invalid admin email or password', 401);
    }

    const token = createAdminToken(adminUser.email, adminUser.name, adminUser.id);
    return res.status(200).json({
      success: true,
      message: 'Admin authentication successful',
      data: {
        token,
        admin: {
          id: adminUser.id,
          name: adminUser.name,
          email: adminUser.email,
          role: adminUser.role,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminProfileHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Unauthorized: Token missing', 401);
    }

    const token = authHeader.split(' ')[1];
    const payload = verifyAdminToken(token);

    if (!payload) {
      throw new AppError('Unauthorized: Token invalid or expired', 401);
    }

    res.status(200).json({
      success: true,
      data: {
        id: payload.id,
        name: payload.name,
        email: payload.email,
        role: payload.role,
        authenticatedAt: new Date(payload.iat * 1000).toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
};
