import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import prisma from '../lib/prisma';
import { sendSuccess, sendError } from '../utils/response';

export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return sendError(res, 'Unauthorized', 401);
    }

    const userId = req.user.id;

    // Start of today UTC
    const startOfToday = new Date();
    startOfToday.setUTCHours(0, 0, 0, 0);

    const [user, totalImages, uploadedTodayCount, recentUploads] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { storageLimit: true, storageUsed: true, name: true, email: true, createdAt: true },
      }),
      prisma.image.count({
        where: { userId },
      }),
      prisma.image.count({
        where: {
          userId,
          createdAt: { gte: startOfToday },
        },
      }),
      prisma.image.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 8,
      }),
    ]);

    if (!user) {
      return sendError(res, 'User record not found', 404);
    }

    const storageUsedMB = user.storageUsed / (1024 * 1024);
    const storageLimitMB = user.storageLimit / (1024 * 1024);
    const percentageUsed = Math.min(100, Number(((user.storageUsed / user.storageLimit) * 100).toFixed(1)));

    return sendSuccess(res, {
      user: {
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
      stats: {
        totalImages,
        storageUsedBytes: user.storageUsed,
        storageLimitBytes: user.storageLimit,
        storageUsedMB: Number(storageUsedMB.toFixed(2)),
        storageLimitMB: Number(storageLimitMB.toFixed(2)),
        storageUsedGB: Number((storageUsedMB / 1024).toFixed(2)),
        storageLimitGB: Number((storageLimitMB / 1024).toFixed(2)),
        percentageUsed,
        imagesUploadedToday: uploadedTodayCount,
      },
      recentUploads,
    });
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to load dashboard stats', 400);
  }
};
