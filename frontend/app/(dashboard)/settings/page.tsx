'use client';

import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { api } from '../../../lib/api';
import { Settings, Trash2, Lock, HardDrive, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [password, setPassword] = useState('');
  const [deleting, setDeleting] = useState(false);

  if (!user) return null;

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      toast.error('Password is required to confirm account deletion.');
      return;
    }

    setDeleting(true);
    try {
      const res = await api.delete('/users/account', {
        data: { password },
      });
      if (res.data.success) {
        toast.success('Account and all stored image assets deleted permanently.');
        logout();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete account.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-brand-400" /> Account Settings
        </h1>
        <p className="text-sm text-slate-400">
          Configure account preferences, storage options, and security settings.
        </p>
      </div>

      {/* Storage Plan Summary */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <HardDrive className="w-5 h-5 text-brand-400" /> Storage Capacity Plan
        </h2>
        <p className="text-sm text-slate-300">
          Your account is currently assigned a standard quota of{' '}
          <span className="font-bold text-white">5.0 GB</span> of high-speed cloud object storage.
        </p>
      </div>

      {/* Danger Zone: Delete Account */}
      <div className="glass-panel p-6 rounded-3xl border border-rose-500/30 space-y-4 bg-rose-500/5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-rose-500/20 text-rose-400 rounded-xl border border-rose-500/30">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-rose-400">Danger Zone</h2>
            <p className="text-xs text-slate-400">
              Permanently delete your account and remove all uploaded images.
            </p>
          </div>
        </div>

        <p className="text-sm text-slate-300">
          Once you delete your account, all image records and stored cloud binary files will be permanently erased. This action is immediate and cannot be reversed.
        </p>

        <button
          onClick={() => setShowDeleteModal(true)}
          className="flex items-center gap-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-rose-600/30 transition-all"
        >
          <Trash2 className="w-4 h-4" />
          Delete Account Permanently
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel max-w-md w-full p-6 rounded-3xl border border-rose-500/40 space-y-4">
            <h3 className="text-lg font-bold text-white text-center">Confirm Account Deletion</h3>
            <p className="text-xs text-slate-300 text-center">
              Please enter your account password to confirm permanent account and image deletion.
            </p>

            <form onSubmit={handleDeleteAccount} className="space-y-4">
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your current password"
                  className="w-full bg-slate-900 border border-slate-800 text-white text-sm rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-rose-500 transition-colors"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  disabled={deleting}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2.5 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={deleting}
                  className="flex-1 bg-rose-600 hover:bg-rose-500 text-white py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-rose-600/30 disabled:opacity-50"
                >
                  {deleting ? 'Deleting...' : 'Permanently Delete'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
