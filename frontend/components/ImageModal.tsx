'use client';

import React, { useState } from 'react';
import { X, Trash2, Download, Copy, Calendar, HardDrive, FileText, Check } from 'lucide-react';
import { ImageItem } from '../types';
import { getFullImageUrl } from '../lib/api';
import { toast } from 'sonner';

interface ImageModalProps {
  image: ImageItem | null;
  onClose: () => void;
  onConfirmDelete: (image: ImageItem) => Promise<void>;
}

export const ImageModal: React.FC<ImageModalProps> = ({ image, onClose, onConfirmDelete }) => {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!image) return null;

  const fullUrl = getFullImageUrl(image.url);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    toast.success('Image URL copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onConfirmDelete(image);
      toast.success('Image deleted successfully');
      setShowConfirmDelete(false);
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete image');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      {/* Modal Card */}
      <div className="relative w-full max-w-4xl bg-[#1e293b] border border-slate-700 rounded-3xl overflow-hidden shadow-2xl flex flex-col lg:flex-row max-h-[90vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-slate-900/80 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Large Image Preview Area */}
        <div className="w-full lg:w-3/5 bg-slate-950 flex items-center justify-center p-6 min-h-[300px] max-h-[500px] lg:max-h-[600px] overflow-hidden">
          <img
            src={fullUrl}
            alt={image.originalName}
            className="max-w-full max-h-full object-contain rounded-xl shadow-lg"
          />
        </div>

        {/* Metadata & Actions Right Panel */}
        <div className="w-full lg:w-2/5 p-6 lg:p-8 flex flex-col justify-between space-y-6 overflow-y-auto">
          <div>
            <div className="border-b border-slate-800 pb-4 mb-4">
              <h2 className="text-xl font-bold text-white truncate" title={image.originalName}>
                {image.originalName}
              </h2>
              <p className="text-xs text-brand-400 font-mono mt-1">ID: {image.id}</p>
            </div>

            {/* Metadata Fields */}
            <div className="space-y-4 text-sm text-slate-300">
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <p className="text-xs text-slate-400 font-medium">MIME Type</p>
                  <p className="font-semibold text-slate-200">{image.mimeType}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <HardDrive className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <p className="text-xs text-slate-400 font-medium">File Size</p>
                  <p className="font-semibold text-slate-200">{formatSize(image.size)}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <p className="text-xs text-slate-400 font-medium">Uploaded Date</p>
                  <p className="font-semibold text-slate-200">
                    {new Date(image.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-3 pt-4 border-t border-slate-800">
            <div className="flex gap-2">
              <button
                onClick={handleCopyLink}
                className="flex-1 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied' : 'Copy URL'}
              </button>

              <a
                href={fullUrl}
                target="_blank"
                rel="noreferrer"
                download
                className="flex items-center justify-center p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-colors"
                title="Download"
              >
                <Download className="w-4 h-4" />
              </a>
            </div>

            <button
              onClick={() => setShowConfirmDelete(true)}
              className="w-full flex items-center justify-center gap-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors"
            >
              <Trash2 className="w-4 h-4" /> Delete Image
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal Overlay */}
      {showConfirmDelete && (
        <div className="fixed inset-0 z-60 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel max-w-md w-full p-6 rounded-3xl border border-rose-500/30 space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 mx-auto flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-white">Delete Image?</h3>
            <p className="text-sm text-slate-300">
              Are you sure you want to permanently delete:
            </p>
            <p className="text-sm font-semibold text-rose-300 bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20 truncate">
              {image.originalName}
            </p>
            <p className="text-xs text-slate-400">This action cannot be undone.</p>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowConfirmDelete(false)}
                disabled={isDeleting}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2.5 rounded-xl text-sm font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 bg-rose-600 hover:bg-rose-500 text-white py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-rose-600/30 transition-colors disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
