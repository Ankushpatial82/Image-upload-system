export interface User {
  id: string;
  name: string;
  email: string;
  storageLimit: number;
  storageUsed: number;
  createdAt: string;
  updatedAt?: string;
  totalImages?: number;
}

export interface ImageItem {
  id: string;
  userId: string;
  originalName: string;
  fileName: string;
  mimeType: string;
  size: number;
  url: string;
  storageKey: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  user: {
    name: string;
    email: string;
    createdAt: string;
  };
  stats: {
    totalImages: number;
    storageUsedBytes: number;
    storageLimitBytes: number;
    storageUsedMB: number;
    storageLimitMB: number;
    storageUsedGB: number;
    storageLimitGB: number;
    percentageUsed: number;
    imagesUploadedToday: number;
  };
  recentUploads: ImageItem[];
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  meta?: PaginationMeta;
}

export interface UploadFileItem {
  id: string;
  file: File;
  previewUrl: string;
  status: 'idle' | 'uploading' | 'success' | 'error';
  progress: number;
  errorMessage?: string;
}
