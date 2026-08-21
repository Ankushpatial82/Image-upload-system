import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { env } from '../config/env';

function isCloudinaryConfigured(): boolean {
  return Boolean(
    env.CLOUDINARY_CLOUD_NAME &&
      env.CLOUDINARY_CLOUD_NAME !== 'demo_cloud' &&
      env.CLOUDINARY_API_KEY &&
      env.CLOUDINARY_API_SECRET &&
      env.CLOUDINARY_API_SECRET !== 'your_api_secret_here' &&
      env.CLOUDINARY_API_SECRET !== 'secret_key_demo'
  );
}

function initCloudinary() {
  if (isCloudinaryConfigured()) {
    cloudinary.config({
      cloud_name: env.CLOUDINARY_CLOUD_NAME,
      api_key: env.CLOUDINARY_API_KEY,
      api_secret: env.CLOUDINARY_API_SECRET,
      secure: true,
    });
  }
}

initCloudinary();

// Local storage directory fallback
const UPLOAD_DIR = path.resolve(__dirname, '../../uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export interface UploadResult {
  url: string;
  storageKey: string;
}

export async function uploadToStorage(
  fileBuffer: Buffer,
  originalFilename: string,
  mimeType: string,
  userId: string
): Promise<UploadResult> {
  const extension = path.extname(originalFilename).toLowerCase() || getExtensionFromMime(mimeType);
  const randomId = crypto.randomBytes(16).toString('hex');
  const storageKey = `users/${userId}/images/${randomId}${extension}`;

  if (isCloudinaryConfigured()) {
    return new Promise((resolve, reject) => {
      const publicId = `users/${userId}/images/${randomId}`;
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          public_id: publicId,
          resource_type: 'image',
          folder: `image_upload_system/users/${userId}`,
        },
        (error, result) => {
          if (error || !result) {
            return reject(new Error(error?.message || 'Cloudinary upload failed'));
          }
          resolve({
            url: result.secure_url,
            storageKey: result.public_id,
          });
        }
      );
      uploadStream.end(fileBuffer);
    });
  } else {
    // Local storage fallback for development / testing without live Cloudinary keys
    const userDir = path.join(UPLOAD_DIR, userId);
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
    }
    const localFilePath = path.join(userDir, `${randomId}${extension}`);
    await fs.promises.writeFile(localFilePath, fileBuffer);

    // Servable URL relative to backend
    const url = `/uploads/${userId}/${randomId}${extension}`;
    return {
      url,
      storageKey: localFilePath,
    };
  }
}

export async function deleteFromStorage(storageKey: string): Promise<void> {
  if (isCloudinaryConfigured() && !storageKey.includes(path.sep) && !storageKey.startsWith('/')) {
    try {
      await cloudinary.uploader.destroy(storageKey);
    } catch (err) {
      console.error('Failed to delete image from Cloudinary:', err);
    }
  } else {
    // Delete local file fallback
    try {
      if (fs.existsSync(storageKey)) {
        await fs.promises.unlink(storageKey);
      }
    } catch (err) {
      console.error('Failed to delete local image file:', err);
    }
  }
}

function getExtensionFromMime(mimeType: string): string {
  switch (mimeType) {
    case 'image/jpeg':
      return '.jpg';
    case 'image/png':
      return '.png';
    case 'image/webp':
      return '.webp';
    default:
      return '.jpg';
  }
}
