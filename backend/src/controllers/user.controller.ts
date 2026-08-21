import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth.middleware';
import prisma from '../lib/prisma';
import { deleteFromStorage } from '../utils/storage';
import { sendSuccess, sendError } from '../utils/response';
import { logAuditAction } from '../services/audit.service';

const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
});

const deleteAccountSchema = z.object({
  password: z.string().min(1, 'Password is required to confirm account deletion'),
});

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return sendError(res, 'Unauthorized', 401);
    }

    const { name } = updateProfileSchema.parse(req.body);

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: { name },
      select: { id: true, name: true, email: true, storageLimit: true, storageUsed: true, createdAt: true },
    });

    await logAuditAction(req.user.id, 'PROFILE_UPDATE', `Updated name to "${name}"`);
    return sendSuccess(res, updatedUser, 'Profile updated successfully');
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return sendError(res, error.errors[0]?.message || 'Validation error', 400);
    }
    return sendError(res, error.message || 'Failed to update profile', 400);
  }
};

export const deleteAccount = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return sendError(res, 'Unauthorized', 401);
    }

    const { password } = deleteAccountSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { images: true },
    });

    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return sendError(res, 'Incorrect password. Account deletion cancelled.', 400);
    }

    // 1. Delete all user images from Cloud Storage
    for (const image of user.images) {
      await deleteFromStorage(image.storageKey);
    }

    // 2. Log audit before deletion
    await logAuditAction(req.user.id, 'ACCOUNT_DELETE', `User ${user.email} deleted their account.`);

    // 3. Delete user from database (Cascade deletes images and audit logs)
    await prisma.user.delete({
      where: { id: req.user.id },
    });

    return sendSuccess(res, null, 'Account and all associated image assets deleted permanently');
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return sendError(res, error.errors[0]?.message || 'Validation error', 400);
    }
    return sendError(res, error.message || 'Account deletion failed', 400);
  }
};
