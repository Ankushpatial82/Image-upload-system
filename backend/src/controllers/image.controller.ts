import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import * as imageService from '../services/image.service';
import { sendSuccess, sendError } from '../utils/response';

export const uploadImages = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return sendError(res, 'Unauthorized', 401);
    }

    const files = req.files as Express.Multer.File[] | undefined;
    const singleFile = req.file as Express.Multer.File | undefined;

    const fileList = files || (singleFile ? [singleFile] : []);

    if (fileList.length === 0) {
      return sendError(res, 'No image file uploaded. Please select an image.', 400);
    }

    const uploaded = await imageService.uploadUserImages(req.user.id, fileList);
    return sendSuccess(res, uploaded, 'Image(s) uploaded successfully', 201);
  } catch (error: any) {
    return sendError(res, error.message || 'Image upload failed', 400);
  }
};

export const listImages = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return sendError(res, 'Unauthorized', 401);
    }

    const { page, limit, search, sortBy } = req.query;

    const result = await imageService.getUserImages(req.user.id, {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search: typeof search === 'string' ? search : Array.isArray(search) ? String(search[0]) : undefined,
      sortBy: typeof sortBy === 'string' ? sortBy : Array.isArray(sortBy) ? String(sortBy[0]) : undefined,
    });

    return sendSuccess(res, result.images, 'Images retrieved successfully', 200, result.pagination);
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to list images', 400);
  }
};

export const getImage = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return sendError(res, 'Unauthorized', 401);
    }

    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const image = await imageService.getImageById(req.user.id, id);
    return sendSuccess(res, image);
  } catch (error: any) {
    const status = error.message.includes('authorized') ? 403 : 404;
    return sendError(res, error.message || 'Image not found', status);
  }
};

export const deleteImage = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return sendError(res, 'Unauthorized', 401);
    }

    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const result = await imageService.deleteUserImage(req.user.id, id);
    return sendSuccess(res, result, 'Image deleted successfully');
  } catch (error: any) {
    const status = error.message.includes('authorized') ? 403 : 400;
    return sendError(res, error.message || 'Failed to delete image', status);
  }
};
