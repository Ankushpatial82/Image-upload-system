'use client';

import React from 'react';
import { ImageGallery } from '../../../components/ImageGallery';
import { Images } from 'lucide-react';

export default function ImagesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Images className="w-6 h-6 text-brand-400" /> Image Gallery
          </h1>
          <p className="text-sm text-slate-400">
            Browse, search, sort, and manage all your uploaded image assets.
          </p>
        </div>
      </div>

      <ImageGallery />
    </div>
  );
}
