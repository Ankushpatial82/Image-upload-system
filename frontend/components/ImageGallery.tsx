'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, ArrowUpDown, ChevronLeft, ChevronRight, UploadCloud, Images as GalleryIcon } from 'lucide-react';
import { ImageItem, PaginationMeta } from '../types';
import { api } from '../lib/api';
import { ImageCard } from './ImageCard';
import { ImageModal } from './ImageModal';
import { toast } from 'sonner';

export const ImageGallery: React.FC = () => {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [pagination, setPagination] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: 12,
    totalPages: 1,
  });

  const [selectedImage, setSelectedImage] = useState<ImageItem | null>(null);

  const fetchImages = async () => {
    setLoading(true);
    try {
      const res = await api.get('/images', {
        params: {
          page,
          limit,
          search: search || undefined,
          sortBy,
        },
      });

      if (res.data.success) {
        setImages(res.data.data);
        if (res.data.meta) {
          setPagination(res.data.meta);
        }
      }
    } catch (err: any) {
      toast.error('Failed to load image gallery');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, [page, sortBy]);

  // Debounced search handling
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchImages();
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const handleDeleteImage = async (image: ImageItem) => {
    try {
      const res = await api.delete(`/images/${image.id}`);
      if (res.data.success) {
        setImages((prev) => prev.filter((img) => img.id !== image.id));
        setPagination((prev) => ({ ...prev, total: Math.max(0, prev.total - 1) }));
        fetchImages();
      }
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Failed to delete image');
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Sort Toolbar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search images..."
            className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-sm rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-brand-500 transition-colors placeholder:text-slate-500"
          />
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <ArrowUpDown className="w-4 h-4 text-brand-400" /> Sort by:
          </div>
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setPage(1);
            }}
            className="bg-slate-900 border border-slate-800 text-slate-200 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-brand-500 transition-colors cursor-pointer"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="name_asc">Name (A - Z)</option>
            <option value="name_desc">Name (Z - A)</option>
            <option value="size_desc">Largest Size</option>
            <option value="size_asc">Smallest Size</option>
          </select>
        </div>
      </div>

      {/* Loading Skeletons */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="glass-card rounded-2xl p-4 space-y-3 animate-pulse border border-slate-800">
              <div className="h-44 bg-slate-800 rounded-xl w-full" />
              <div className="h-4 bg-slate-800 rounded w-3/4" />
              <div className="h-3 bg-slate-800 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : images.length === 0 ? (
        /* Empty State (Requirement #33) */
        <div className="glass-panel p-12 lg:p-16 rounded-3xl border border-slate-800 text-center space-y-5 my-8">
          <div className="w-20 h-20 rounded-3xl bg-slate-900 border border-slate-800 text-brand-400 mx-auto flex items-center justify-center shadow-lg">
            <GalleryIcon className="w-10 h-10" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-white">No Images Yet</h3>
            <p className="text-sm text-slate-400 max-w-sm mx-auto">
              {search
                ? `No images matched your query "${search}". Try searching with a different keyword.`
                : 'Upload your first image to get started.'}
            </p>
          </div>
          {!search && (
            <Link
              href="/upload"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-sm px-6 py-3 rounded-2xl shadow-lg shadow-brand-600/30 transition-all hover:scale-105"
            >
              <UploadCloud className="w-5 h-5" />
              Upload Image
            </Link>
          )}
        </div>
      ) : (
        /* Responsive Grid: 4 cols desktop, 2 cols tablet, 1 col mobile */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {images.map((img) => (
            <ImageCard
              key={img.id}
              image={img}
              onView={(target) => setSelectedImage(target)}
              onDelete={handleDeleteImage}
            />
          ))}
        </div>
      )}

      {/* Pagination Controls (Requirement #40) */}
      {!loading && images.length > 0 && (
        <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-slate-400">
          <div>
            Showing {Math.min((page - 1) * limit + 1, pagination.total)}–
            {Math.min(page * limit, pagination.total)} of {pagination.total} images
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-brand-400">
              Page {page} of {pagination.totalPages}
            </span>

            <button
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={page >= pagination.totalPages}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Image Modal Viewer */}
      {selectedImage && (
        <ImageModal
          image={selectedImage}
          onClose={() => setSelectedImage(null)}
          onConfirmDelete={handleDeleteImage}
        />
      )}
    </div>
  );
};
