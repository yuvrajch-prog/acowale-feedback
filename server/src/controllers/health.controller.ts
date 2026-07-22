import { Request, Response } from 'express';

const startTime = Date.now();

export const healthCheckHandler = (_req: Request, res: Response) => {
  const memoryUsage = process.memoryUsage();
  const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);

  res.status(200).json({
    status: 'OK',
    service: 'Acowale CRM Backend API',
    uptime: `${uptimeSeconds}s`,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    system: {
      nodeVersion: process.version,
      platform: process.platform,
      memory: {
        rssMB: Math.round(memoryUsage.rss / 1024 / 1024),
        heapTotalMB: Math.round(memoryUsage.heapTotal / 1024 / 1024),
        heapUsedMB: Math.round(memoryUsage.heapUsed / 1024 / 1024),
      },
    },
  });
};
