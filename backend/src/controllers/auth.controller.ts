import { Request, Response } from 'express';
import { z } from 'zod';
import * as authService from '../services/auth.service';
import { sendSuccess, sendError } from '../utils/response';
import { AuthRequest } from '../middleware/auth.middleware';
import { logAuditAction } from '../services/audit.service';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters long'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const register = async (req: Request, res: Response) => {
  try {
    const validatedData = registerSchema.parse(req.body);
    const result = await authService.registerUser(validatedData);
    await logAuditAction(result.user.id, 'USER_REGISTER', `User ${result.user.email} registered.`);
    return sendSuccess(res, result, 'Registration successful', 201);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return sendError(res, error.errors[0]?.message || 'Validation error', 400);
    }
    return sendError(res, error.message || 'Registration failed', 400);
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const validatedData = loginSchema.parse(req.body);
    const result = await authService.loginUser(validatedData);
    await logAuditAction(result.user.id, 'USER_LOGIN', `User ${result.user.email} logged in.`);
    return sendSuccess(res, result, 'Login successful');
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return sendError(res, error.errors[0]?.message || 'Validation error', 400);
    }
    return sendError(res, error.message || 'Login failed', 401);
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return sendError(res, 'Unauthorized', 401);
    }
    const profile = await authService.getUserProfile(req.user.id);
    return sendSuccess(res, profile);
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to fetch user profile', 400);
  }
};
