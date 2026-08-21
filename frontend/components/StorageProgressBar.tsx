'use client';

import React from 'react';
import { HardDrive, AlertTriangle } from 'lucide-react';

interface StorageProgressBarProps {
  usedBytes: number;
  limitBytes: number;
  showDetails?: boolean;
}

export const StorageProgressBar: React.FC<StorageProgressBarProps> = ({
  usedBytes,
  limitBytes,
  showDetails = true,
}) => {
  const usedMB = (usedBytes / (1024 * 1024)).toFixed(1);
  const limitMB = (limitBytes / (1024 * 1024)).toFixed(0);
  const usedGB = (usedBytes / (1024 * 1024 * 1024)).toFixed(2);
  const limitGB = (limitBytes / (1024 * 1024 * 1024)).toFixed(1);

  const percentage = limitBytes > 0 ? Math.min(100, Math.round((usedBytes / limitBytes) * 100)) : 0;

  const isWarning = percentage >= 75 && percentage < 90;
  const isCritical = percentage >= 90;

  return (
    <div className="w-full glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-lg ${isCritical ? 'bg-rose-500/20 text-rose-400' : 'bg-brand-500/20 text-brand-400'}`}>
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-200">Storage Usage</h4>
            {showDetails && (
              <p className="text-xs text-slate-400">
                {usedGB} GB of {limitGB} GB used
              </p>
            )}
          </div>
        </div>
        <div className="text-right">
          <span className={`text-base font-bold ${isCritical ? 'text-rose-400' : isWarning ? 'text-amber-400' : 'text-brand-400'}`}>
            {percentage}%
          </span>
        </div>
      </div>

      {/* Progress Bar Container */}
      <div className="relative w-full bg-slate-900 h-3 rounded-full overflow-hidden p-0.5 border border-slate-800">
        <div
          className={`h-full rounded-full transition-all duration-700 ${
            isCritical
              ? 'bg-gradient-to-r from-rose-500 to-red-600'
              : isWarning
              ? 'bg-gradient-to-r from-amber-500 to-orange-500'
              : 'bg-gradient-to-r from-brand-500 via-indigo-500 to-violet-500 shadow-glow'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {isCritical && (
        <div className="flex items-center gap-2 text-xs text-rose-400 bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>Storage capacity nearly full. Delete old files to free up space.</span>
        </div>
      )}

      {!showDetails && (
        <p className="text-xs text-slate-400 text-right">
          {usedMB} MB / {limitMB} MB
        </p>
      )}
    </div>
  );
};
