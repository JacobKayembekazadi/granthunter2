'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatusTileProps {
  icon: LucideIcon;
  label: string;
  value: string;
  sub: string;
  color: 'blue' | 'emerald' | 'purple' | 'amber';
  trend?: {
    value: number;
    isPositive: boolean;
  };
  onClick?: () => void;
}

const StatusTile: React.FC<StatusTileProps> = ({
  icon: Icon,
  label,
  value,
  sub,
  color,
  trend,
  onClick,
}) => {
  const colors = {
    blue: 'text-blue-500 border-blue-500/20 bg-blue-500/5',
    emerald: 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5',
    purple: 'text-purple-500 border-purple-500/20 bg-purple-500/5',
    amber: 'text-amber-500 border-amber-500/20 bg-amber-500/5',
  };

  return (
    <div
      onClick={onClick}
      className={`p-4 border rounded-xl ${colors[color]} relative group transition-all ${
        onClick ? 'cursor-pointer hover:border-opacity-40' : ''
      }`}
    >
      <div className="flex justify-between items-center mb-1">
        <span className="text-[9px] font-bold tracking-widest text-slate-500 uppercase">
          {label}
        </span>
        <Icon className="w-4 h-4 opacity-40" />
      </div>
      <div className="flex items-baseline space-x-2">
        <span className="text-2xl font-bold tracking-tighter">{value}</span>
        <span className="text-[9px] font-bold text-slate-600 uppercase">{sub}</span>
        {trend && (
          <span
            className={`text-[9px] font-bold ${
              trend.isPositive ? 'text-emerald-400' : 'text-red-400'
            }`}
          >
            {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value).toFixed(1)}%
          </span>
        )}
      </div>
    </div>
  );
};

export default StatusTile;

