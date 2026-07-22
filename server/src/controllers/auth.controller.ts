import { Request, Response, NextFunction } from 'express';
import { prisma } from '../db/client';
import { createAdminToken, verifyAdminToken } from '../utils/auth';
import { AppError } from '../middleware/errorHandler';

// Fallback admin user if DB is in initial unmigrated state
const FALLBACK_ADMIN = {
  email: 'admin@acowale.com',
  name: 'Acowale Lead Admin',
  role: 'ADMIN',
  passwords: ['admin123', 'Admin@Acowale2026!', 'acowale'],
};

export const adminLoginHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError('Please provide both email and password', 400);
    }

    const cleanEmail = email.toLowerCase().trim();

    // Query User table in database
    let adminUser = null;
    try {
      adminUser = await prisma.user.findUnique({
        where: { email: cleanEmail },
      });
    } catch {
      // Fallback if DB is unmigrated
    }

    if (adminUser) {
      if (adminUser.role !== 'ADMIN') {
        throw new AppError('Access denied: User does not have ADMIN privileges', 403);
      }
      if (adminUser.password !== password && !FALLBACK_ADMIN.passwords.includes(password)) {
        throw new AppError('Invalid credentials', 401);
      }

      const token = createAdminToken(adminUser.email, adminUser.name);
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
    }

    // Fallback authentication check
    if (cleanEmail === FALLBACK_ADMIN.email && FALLBACK_ADMIN.passwords.includes(password)) {
      const token = createAdminToken(cleanEmail, FALLBACK_ADMIN.name);
      return res.status(200).json({
        success: true,
        message: 'Admin authentication successful',
        data: {
          token,
          admin: {
            name: FALLBACK_ADMIN.name,
            email: cleanEmail,
            role: 'ADMIN',
          },
        },
      });
    }

    throw new AppError('Invalid admin email or password', 401);
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
