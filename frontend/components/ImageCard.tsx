'use client';

import React from 'react';
import { Eye, Trash2, Calendar, HardDrive } from 'lucide-react';
import { ImageItem } from '../types';
import { getFullImageUrl } from '../lib/api';

interface ImageCardProps {
  image: ImageItem;
  onView: (image: ImageItem) => void;
  onDelete: (image: ImageItem) => void;
}

export const ImageCard: React.FC<ImageCardProps> = ({ image, onView, onDelete }) => {
  const fullUrl = getFullImageUrl(image.url);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="glass-card rounded-2xl overflow-hidden group border border-slate-800 hover:border-brand-500/40 transition-all duration-300 flex flex-col justify-between">
      {/* Thumbnail Container */}
      <div
        className="relative h-48 w-full bg-slate-900 overflow-hidden cursor-pointer flex items-center justify-center group"
        onClick={() => onView(image)}
      >
        <img
          src={fullUrl}
          alt={image.originalName}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
        {/* Overlay hover actions */}
        <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onView(image);
            }}
            className="p-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl shadow-lg transition-transform hover:scale-110"
            title="View Details"
          >
            <Eye className="w-5 h-5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(image);
            }}
            className="p-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl shadow-lg transition-transform hover:scale-110"
            title="Delete Image"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-4 space-y-2">
        <h3 className="text-sm font-semibold text-slate-100 truncate" title={image.originalName}>
          {image.originalName}
        </h3>

        <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
          <span className="flex items-center gap-1">
            <HardDrive className="w-3.5 h-3.5 text-brand-400" />
            {formatSize(image.size)}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            {formatDate(image.createdAt)}
          </span>
        </div>

        {/* Quick buttons */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
          <button
            onClick={() => onView(image)}
            className="flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors flex items-center justify-center gap-1"
          >
            <Eye className="w-3.5 h-3.5" /> View
          </button>
          <button
            onClick={() => onDelete(image)}
            className="py-1.5 px-3 rounded-lg text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
