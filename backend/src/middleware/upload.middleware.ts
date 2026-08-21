import multer from 'multer';
import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const storage = multer.memoryStorage();

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const extension = file.originalname.toLowerCase().slice(file.originalname.lastIndexOf('.'));
  
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype) || !ALLOWED_EXTENSIONS.includes(extension)) {
    return cb(new Error(`Invalid file type (${extension || file.mimetype}). Only JPG, JPEG, PNG, and WEBP images under 5 MB are allowed.`));
  }

  cb(null, true);
};

export const multerUpload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
  fileFilter,
});

export const handleMulterUpload = (uploadMiddleware: any) => {
  return (req: Request, res: Response, next: NextFunction) => {
    uploadMiddleware(req, res, (err: any) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return sendError(res, 'File size exceeds maximum allowed limit of 5 MB.', 400);
        }
        return sendError(res, `Upload error: ${err.message}`, 400);
      } else if (err) {
        return sendError(res, err.message || 'File upload validation failed.', 400);
      }
      next();
    });
  };
};
