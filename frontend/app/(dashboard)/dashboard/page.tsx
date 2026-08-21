'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { StatCard } from '../../../components/StatCard';
import { StorageProgressBar } from '../../../components/StorageProgressBar';
import { ImageCard } from '../../../components/ImageCard';
import { ImageModal } from '../../../components/ImageModal';
import { api } from '../../../lib/api';
import { DashboardStats, ImageItem } from '../../../types';
import { Images, HardDrive, Calendar, Clock, UploadCloud, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export default function DashboardPage() {
  const [data, setData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<ImageItem | null>(null);

  const fetchStats = async () => {
    try {
      const res = await api.get('/dashboard/stats');
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err: any) {
      toast.error('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleDeleteImage = async (image: ImageItem) => {
    try {
      const res = await api.delete(`/images/${image.id}`);
      if (res.data.success) {
        fetchStats();
      }
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Failed to delete image');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-slate-800 rounded w-1/4 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 bg-slate-800 rounded-2xl animate-pulse" />
          ))}
        </div>
        <div className="h-32 bg-slate-800 rounded-2xl animate-pulse" />
      </div>
    );
  }

  const stats = data?.stats;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="glass-panel p-6 lg:p-8 rounded-3xl border border-slate-800 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 z-10">
          <h1 className="text-2xl lg:text-3xl font-extrabold text-white">
            Welcome back, {data?.user.name || 'User'}! 👋
          </h1>
          <p className="text-sm text-slate-400 max-w-xl">
            Here is your cloud storage overview. You have uploaded{' '}
            <span className="text-brand-400 font-bold">{stats?.totalImages || 0}</span> images using{' '}
            <span className="text-brand-400 font-bold">{stats?.storageUsedGB || 0} GB</span> out of your{' '}
            {stats?.storageLimitGB || 5} GB limit.
          </p>
        </div>

        <Link
          href="/upload"
          className="z-10 flex items-center gap-2 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-sm px-6 py-3.5 rounded-2xl shadow-lg shadow-brand-600/30 transition-all hover:scale-105 shrink-0"
        >
          <UploadCloud className="w-5 h-5" />
          Upload New Image
        </Link>
      </div>

      {/* Summary Stat Cards (Requirement #7) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Images"
          value={stats?.totalImages || 0}
          subtitle="Assets stored in cloud"
          icon={Images}
          color="brand"
        />
        <StatCard
          title="Storage Used"
          value={`${stats?.storageUsedGB || 0} GB`}
          subtitle={`Limit: ${stats?.storageLimitGB || 5} GB`}
          icon={HardDrive}
          color="indigo"
        />
        <StatCard
          title="Uploaded Today"
          value={stats?.imagesUploadedToday || 0}
          subtitle="New uploads"
          icon={Calendar}
          color="emerald"
        />
        <StatCard
          title="Recent Uploads"
          value={data?.recentUploads.length || 0}
          subtitle="Latest items"
          icon={Clock}
          color="violet"
        />
      </div>

      {/* Storage Progress Bar (Requirement #7) */}
      <StorageProgressBar
        usedBytes={stats?.storageUsedBytes || 0}
        limitBytes={stats?.storageLimitBytes || 5368709120}
      />

      {/* Recent Uploads Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Recent Uploads</h2>
            <p className="text-xs text-slate-400">Latest media added to your workspace</p>
          </div>
          <Link
            href="/images"
            className="flex items-center gap-1.5 text-xs font-bold text-brand-400 hover:text-brand-300 transition-colors"
          >
            <span>View All Images</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {!data?.recentUploads || data.recentUploads.length === 0 ? (
          <div className="glass-panel p-8 rounded-2xl border border-slate-800 text-center space-y-3">
            <p className="text-sm text-slate-400">No recent uploads found.</p>
            <Link
              href="/upload"
              className="inline-flex items-center gap-2 text-xs font-bold text-brand-400 hover:underline"
            >
              Upload your first image now
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {data.recentUploads.map((image) => (
              <ImageCard
                key={image.id}
                image={image}
                onView={(img) => setSelectedImage(img)}
                onDelete={handleDeleteImage}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedImage && (
        <ImageModal
          image={selectedImage}
          onClose={() => setSelectedImage(null)}
          onConfirmDelete={handleDeleteImage}
        />
      )}
    </div>
  );
}
