'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, FileImage, X, CheckCircle2, AlertCircle, Trash2, ArrowUpRight } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { UploadFileItem } from '../types';

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];
const ALLOWED_MIMES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export const ImageUploader: React.FC<{ onUploadSuccess?: () => void }> = ({ onUploadSuccess }) => {
  const { refreshUser } = useAuth();
  const [selectedFiles, setSelectedFiles] = useState<UploadFileItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const validateFile = (file: File): string | null => {
    const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext) || !ALLOWED_MIMES.includes(file.type)) {
      return `Invalid file type "${ext || file.type}". Only JPG, JPEG, PNG, and WEBP images are supported.`;
    }
    if (file.size > MAX_FILE_SIZE) {
      return `File size (${(file.size / (1024 * 1024)).toFixed(2)} MB) exceeds 5 MB limit.`;
    }
    return null;
  };

  const onDrop = useCallback((acceptedFiles: File[], fileRejections: any[]) => {
    const newItems: UploadFileItem[] = [];

    acceptedFiles.forEach((file) => {
      const errorMsg = validateFile(file);
      newItems.push({
        id: Math.random().toString(36).substring(2, 9),
        file,
        previewUrl: URL.createObjectURL(file),
        status: errorMsg ? 'error' : 'idle',
        progress: 0,
        errorMessage: errorMsg || undefined,
      });
    });

    fileRejections.forEach((rejection) => {
      const file = rejection.file;
      newItems.push({
        id: Math.random().toString(36).substring(2, 9),
        file,
        previewUrl: '',
        status: 'error',
        progress: 0,
        errorMessage: rejection.errors[0]?.message || 'File rejected (Invalid type or size > 5 MB).',
      });
    });

    setSelectedFiles((prev) => [...prev, ...newItems]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    },
    maxSize: MAX_FILE_SIZE,
    multiple: true,
  });

  const removeFile = (id: string) => {
    setSelectedFiles((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target?.previewUrl) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((item) => item.id !== id);
    });
  };

  const clearAll = () => {
    selectedFiles.forEach((item) => {
      if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
    });
    setSelectedFiles([]);
  };

  const handleUploadAll = async () => {
    const validFiles = selectedFiles.filter((item) => item.status === 'idle' || item.status === 'error' && !item.errorMessage);
    if (validFiles.length === 0) {
      toast.error('No valid files selected for upload.');
      return;
    }

    setIsUploading(true);

    const formData = new FormData();
    validFiles.forEach((item) => {
      formData.append('files', item.file);
    });

    // Update status to uploading
    setSelectedFiles((prev) =>
      prev.map((item) =>
        validFiles.some((vf) => vf.id === item.id)
          ? { ...item, status: 'uploading', progress: 30 }
          : item
      )
    );

    try {
      const res = await api.post('/images/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percent = progressEvent.total
            ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
            : 50;
          setSelectedFiles((prev) =>
            prev.map((item) =>
              validFiles.some((vf) => vf.id === item.id)
                ? { ...item, progress: percent }
                : item
            )
          );
        },
      });

      if (res.data.success) {
        setSelectedFiles((prev) =>
          prev.map((item) =>
            validFiles.some((vf) => vf.id === item.id)
              ? { ...item, status: 'success', progress: 100 }
              : item
          )
        );
        toast.success(`Successfully uploaded ${validFiles.length} image(s)!`);
        await refreshUser();
        if (onUploadSuccess) onUploadSuccess();
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Upload failed. Please check file size and storage quota.';
      toast.error(msg);
      setSelectedFiles((prev) =>
        prev.map((item) =>
          validFiles.some((vf) => vf.id === item.id)
            ? { ...item, status: 'error', errorMessage: msg }
            : item
        )
      );
    } finally {
      setIsUploading(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="space-y-6">
      {/* Dropzone Area */}
      <div
        {...getRootProps()}
        className={`glass-panel p-8 lg:p-12 rounded-3xl border-2 border-dashed transition-all duration-300 cursor-pointer text-center relative overflow-hidden group ${
          isDragActive
            ? 'border-brand-400 bg-brand-500/10 scale-[1.01]'
            : 'border-slate-700 hover:border-brand-500/50 hover:bg-slate-800/40'
        }`}
      >
        <input {...getInputProps()} />

        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600/20 to-indigo-500/20 border border-brand-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
            <UploadCloud className="w-8 h-8 text-brand-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white mb-1">
              {isDragActive ? 'Drop your images here now' : 'Drag & Drop Your Images'}
            </h3>
            <p className="text-sm text-slate-400">or click to browse files from your computer</p>
          </div>
          <div className="flex flex-wrap justify-center gap-2 text-xs font-semibold text-slate-400 bg-slate-900/60 px-4 py-2 rounded-xl border border-slate-800">
            <span>JPG</span> • <span>JPEG</span> • <span>PNG</span> • <span>WEBP</span> • <span>Max 5 MB</span>
          </div>
        </div>
      </div>

      {/* Selected Files Preview List */}
      {selectedFiles.length > 0 && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h4 className="text-sm font-semibold text-slate-200">
              Selected Files ({selectedFiles.length})
            </h4>
            <div className="flex items-center gap-3">
              <button
                onClick={clearAll}
                disabled={isUploading}
                className="text-xs font-medium text-slate-400 hover:text-rose-400 transition-colors disabled:opacity-50"
              >
                Clear All
              </button>
              <button
                onClick={handleUploadAll}
                disabled={isUploading || selectedFiles.every((f) => f.status === 'success')}
                className="flex items-center gap-2 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md shadow-brand-600/30 disabled:opacity-50 transition-all"
              >
                {isUploading ? (
                  <span>Uploading...</span>
                ) : (
                  <>
                    <span>Upload All</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {selectedFiles.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between gap-4 transition-all"
              >
                {/* Thumbnail & File Details */}
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  {item.previewUrl ? (
                    <img
                      src={item.previewUrl}
                      alt={item.file.name}
                      className="w-12 h-12 rounded-lg object-cover border border-slate-700 shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center shrink-0">
                      <FileImage className="w-6 h-6 text-slate-400" />
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-200 truncate">{item.file.name}</p>
                    <p className="text-xs text-slate-400">{formatSize(item.file.size)}</p>

                    {/* Error message detail */}
                    {item.errorMessage && (
                      <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {item.errorMessage}
                      </p>
                    )}

                    {/* Upload progress bar */}
                    {item.status === 'uploading' && (
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
                        <div
                          className="bg-brand-500 h-full transition-all duration-300"
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Status Badges & Delete Action */}
                <div className="flex items-center gap-3 shrink-0">
                  {item.status === 'success' && (
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Upload Complete
                    </span>
                  )}
                  {item.status === 'error' && (
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-lg border border-rose-500/20">
                      <X className="w-3.5 h-3.5" /> Rejected
                    </span>
                  )}
                  {item.status === 'uploading' && (
                    <span className="text-xs font-semibold text-brand-400 animate-pulse">
                      Uploading... {item.progress}%
                    </span>
                  )}

                  <button
                    onClick={() => removeFile(item.id)}
                    disabled={isUploading}
                    className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
