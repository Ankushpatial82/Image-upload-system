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
      cloud_name: env.CLOUDINARY_CLOUD_NAME.trim(),
      api_key: env.CLOUDINARY_API_KEY.trim(),
      api_secret: env.CLOUDINARY_API_SECRET.trim(),
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

async function saveToLocalStorage(
  fileBuffer: Buffer,
  randomId: string,
  extension: string,
  userId: string
): Promise<UploadResult> {
  const userDir = path.join(UPLOAD_DIR, userId);
  if (!fs.existsSync(userDir)) {
    fs.mkdirSync(userDir, { recursive: true });
  }
  const localFilePath = path.join(userDir, `${randomId}${extension}`);
  await fs.promises.writeFile(localFilePath, fileBuffer);

  const url = `/uploads/${userId}/${randomId}${extension}`;
  return {
    url,
    storageKey: localFilePath,
  };
}

export async function uploadToStorage(
  fileBuffer: Buffer,
  originalFilename: string,
  mimeType: string,
  userId: string
): Promise<UploadResult> {
  const extension = path.extname(originalFilename).toLowerCase() || getExtensionFromMime(mimeType);
  const randomId = crypto.randomBytes(16).toString('hex');

  if (isCloudinaryConfigured()) {
    try {
      initCloudinary();
      return await new Promise<UploadResult>((resolve, reject) => {
        const publicId = `users/${userId}/images/${randomId}`;
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            public_id: publicId,
            resource_type: 'image',
            folder: `image_upload_system/users/${userId}`,
          },
          (error, result) => {
            if (error || !result) {
              return reject(error || new Error('Cloudinary upload stream returned empty result'));
            }
            resolve({
              url: result.secure_url,
              storageKey: result.public_id,
            });
          }
        );
        uploadStream.end(fileBuffer);
      });
    } catch (err: any) {
      console.warn('Cloudinary upload error:', err.message, '- Falling back to resilient local storage...');
      return await saveToLocalStorage(fileBuffer, randomId, extension, userId);
    }
  } else {
    return await saveToLocalStorage(fileBuffer, randomId, extension, userId);
  }
}

export async function deleteFromStorage(storageKey: string): Promise<void> {
  if (isCloudinaryConfigured() && !storageKey.includes(path.sep) && !storageKey.startsWith('/')) {
    try {
      initCloudinary();
      await cloudinary.uploader.destroy(storageKey);
    } catch (err) {
      console.error('Failed to delete image from Cloudinary:', err);
    }
  } else {
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
