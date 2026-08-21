'use client';

import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { StorageProgressBar } from '../../../components/StorageProgressBar';
import { api } from '../../../lib/api';
import { User, Mail, Calendar, HardDrive, Images, Save, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { user, updateUserLocal, refreshUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);

  if (!user) return null;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || name.trim().length < 2) {
      toast.error('Name must be at least 2 characters long.');
      return;
    }
    setSaving(true);
    try {
      const res = await api.put('/users/profile', { name: name.trim() });
      if (res.data.success) {
        updateUserLocal({ name: name.trim() });
        toast.success('Profile updated successfully!');
        await refreshUser();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const createdDate = new Date(user.createdAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
          <User className="w-6 h-6 text-brand-400" /> User Profile
        </h1>
        <p className="text-sm text-slate-400">
          Manage your personal details and view your account usage metrics.
        </p>
      </div>

      {/* Profile Overview Card */}
      <div className="glass-panel p-6 lg:p-8 rounded-3xl border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-800">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center font-extrabold text-white text-3xl shadow-glow shrink-0">
            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="space-y-1 text-center sm:text-left">
            <h2 className="text-xl font-bold text-white">{user.name}</h2>
            <p className="text-sm text-slate-400 flex items-center justify-center sm:justify-start gap-1.5">
              <Mail className="w-4 h-4 text-brand-400" /> {user.email}
            </p>
            <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                <ShieldCheck className="w-3.5 h-3.5" /> Authenticated User
              </span>
            </div>
          </div>
        </div>

        {/* Profile Edit Form */}
        <form onSubmit={handleSaveProfile} className="space-y-4 max-w-md">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Display Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full bg-slate-900 border border-slate-800 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-brand-500 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Profile Changes'}
          </button>
        </form>
      </div>

      {/* Usage Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-brand-500/10 text-brand-400 rounded-xl">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase">Account Created</p>
              <p className="text-base font-bold text-slate-200">{createdDate}</p>
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl">
              <Images className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase">Total Uploaded Images</p>
              <p className="text-base font-bold text-slate-200">{user.totalImages || 0} Assets</p>
            </div>
          </div>
        </div>
      </div>

      {/* Storage Meter */}
      <StorageProgressBar usedBytes={user.storageUsed} limitBytes={user.storageLimit} />
    </div>
  );
}
