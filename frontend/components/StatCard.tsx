'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: 'brand' | 'indigo' | 'emerald' | 'amber' | 'violet';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'brand',
}) => {
  const colorStyles = {
    brand: 'bg-brand-500/10 text-brand-400 border-brand-500/20',
    indigo: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    violet: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  };

  return (
    <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center justify-between transition-all hover:scale-[1.01] hover:border-slate-700 shadow-md">
      <div className="space-y-1">
        <p className="text-xs font-semibold text-slate-400 tracking-wider uppercase">{title}</p>
        <p className="text-2xl lg:text-3xl font-extrabold text-white">{value}</p>
        {subtitle && <p className="text-xs text-slate-400 font-medium">{subtitle}</p>}
      </div>
      <div className={`p-3.5 rounded-2xl border ${colorStyles[color]} flex items-center justify-center`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );
};
