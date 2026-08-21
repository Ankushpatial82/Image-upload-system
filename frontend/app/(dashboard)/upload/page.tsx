'use client';

import React from 'react';
import { ImageUploader } from '../../../components/ImageUploader';
import { UploadCloud } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function UploadPage() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
          <UploadCloud className="w-6 h-6 text-brand-400" /> Upload Images
        </h1>
        <p className="text-sm text-slate-400">
          Upload single or multiple images to your secure cloud workspace.
        </p>
      </div>

      <ImageUploader onUploadSuccess={() => router.push('/images')} />
    </div>
  );
}
