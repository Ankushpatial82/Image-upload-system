import prisma from '../lib/prisma';
import { uploadToStorage, deleteFromStorage } from '../utils/storage';
import { logAuditAction } from './audit.service';

export interface ImageQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
}

export async function uploadUserImages(
  userId: string,
  files: Express.Multer.File[]
) {
  if (!files || files.length === 0) {
    throw new Error('No image files provided for upload.');
  }

  // Fetch user storage limit and current usage
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { storageLimit: true, storageUsed: true },
  });

  if (!user) {
    throw new Error('User not found.');
  }

  // Calculate total batch size
  const totalBatchSize = files.reduce((acc, file) => acc + file.size, 0);

  if (user.storageUsed + totalBatchSize > user.storageLimit) {
    throw new Error('Storage limit exceeded. Please delete some existing images or upgrade your storage quota.');
  }

  const uploadedImages = [];

  for (const file of files) {
    // 1. Secure upload to cloud storage
    const uploadRes = await uploadToStorage(
      file.buffer,
      file.originalname,
      file.mimetype,
      userId
    );

    // 2. Save metadata to PostgreSQL via Prisma
    const imageRecord = await prisma.image.create({
      data: {
        userId,
        originalName: file.originalname,
        fileName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        url: uploadRes.url,
        storageKey: uploadRes.storageKey,
      },
    });

    // 3. Update user storageUsed
    await prisma.user.update({
      where: { id: userId },
      data: {
        storageUsed: { increment: file.size },
      },
    });

    // 4. Audit Log
    await logAuditAction(
      userId,
      'IMAGE_UPLOAD',
      `Uploaded image "${file.originalname}" (${(file.size / 1024 / 1024).toFixed(2)} MB)`
    );

    uploadedImages.push(imageRecord);
  }

  return uploadedImages;
}

export async function getUserImages(userId: string, params: ImageQueryParams) {
  const page = Math.max(1, Number(params.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(params.limit) || 20));
  const skip = (page - 1) * limit;

  const whereClause: any = {
    userId,
  };

  if (params.search && params.search.trim() !== '') {
    whereClause.OR = [
      { originalName: { contains: params.search.trim(), mode: 'insensitive' } },
      { fileName: { contains: params.search.trim(), mode: 'insensitive' } },
    ];
  }

  let orderBy: any = { createdAt: 'desc' };

  switch (params.sortBy) {
    case 'oldest':
      orderBy = { createdAt: 'asc' };
      break;
    case 'name_asc':
      orderBy = { originalName: 'asc' };
      break;
    case 'name_desc':
      orderBy = { originalName: 'desc' };
      break;
    case 'size_desc':
      orderBy = { size: 'desc' };
      break;
    case 'size_asc':
      orderBy = { size: 'asc' };
      break;
    case 'newest':
    default:
      orderBy = { createdAt: 'desc' };
      break;
  }

  const [images, totalCount] = await Promise.all([
    prisma.image.findMany({
      where: whereClause,
      orderBy,
      skip,
      take: limit,
    }),
    prisma.image.count({
      where: whereClause,
    }),
  ]);

  return {
    images,
    pagination: {
      total: totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit) || 1,
    },
  };
}

export async function getImageById(userId: string, imageId: string) {
  const image = await prisma.image.findUnique({
    where: { id: imageId },
  });

  if (!image) {
    throw new Error('Image not found.');
  }

  // Strict ownership verification (IDOR protection)
  if (image.userId !== userId) {
    throw new Error('You are not authorized to view or access this image.');
  }

  return image;
}

export async function deleteUserImage(userId: string, imageId: string) {
  const image = await prisma.image.findUnique({
    where: { id: imageId },
  });

  if (!image) {
    throw new Error('Image not found.');
  }

  // Strict authorization check (IDOR protection)
  if (image.userId !== userId) {
    throw new Error('You are not authorized to delete this image.');
  }

  // 1. Remove binary object from Cloud Storage / Disk
  await deleteFromStorage(image.storageKey);

  // 2. Delete database record
  await prisma.image.delete({
    where: { id: imageId },
  });

  // 3. Decrement user storageUsed
  await prisma.user.update({
    where: { id: userId },
    data: {
      storageUsed: { decrement: image.size },
    },
  });

  // 4. Record audit entry
  await logAuditAction(
    userId,
    'IMAGE_DELETE',
    `Deleted image "${image.originalName}" (${image.id})`
  );

  return { id: imageId, size: image.size };
}
