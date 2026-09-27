import React from 'react';
import { TelemetryStatus } from '../../types/farm';

interface StatusPillProps {
  status: TelemetryStatus;
  size?: 'xs' | 'sm' | 'md';
  pulse?: boolean;
}

export const StatusPill: React.FC<StatusPillProps> = ({ 
  status, 
  size = 'sm',
  pulse = false
}) => {
  const getStyles = () => {
    switch (status) {
      case 'LIVE':
        return {
          bg: 'bg-emerald-500/10 text-emerald-800 border-emerald-600/20',
          dot: 'bg-emerald-500',
        };
      case 'FRESH':
        return {
          bg: 'bg-sky-500/10 text-sky-800 border-sky-600/20',
          dot: 'bg-sky-500',
        };
      case 'SIMULATED':
        return {
          bg: 'bg-indigo-500/10 text-indigo-800 border-indigo-600/20',
          dot: 'bg-indigo-500',
        };
      case 'ESTIMATED':
        return {
          bg: 'bg-amber-500/10 text-amber-800 border-amber-600/20',
          dot: 'bg-amber-500',
        };
      case 'CACHED':
        return {
          bg: 'bg-slate-500/10 text-slate-700 border-slate-400/30',
          dot: 'bg-slate-400',
        };
      case 'DEGRADED':
        return {
          bg: 'bg-amber-600/15 text-amber-900 border-amber-600/30 font-medium',
          dot: 'bg-amber-600 animate-ping',
        };
      case 'OFFLINE':
        return {
          bg: 'bg-rose-500/10 text-rose-800 border-rose-600/20',
          dot: 'bg-rose-500',
        };
      default:
        return {
          bg: 'bg-neutral-500/10 text-neutral-800 border-neutral-600/20',
          dot: 'bg-neutral-500',
        };
    }
  };

  const style = getStyles();

  const sizeClasses = {
    xs: 'text-[9px] px-1.5 py-0.5 tracking-wider gap-1',
    sm: 'text-[10px] px-2 py-0.5 tracking-wider gap-1.5',
    md: 'text-xs px-2.5 py-1 tracking-wide gap-2',
  }[size];

  return (
    <span 
      className={`inline-flex items-center rounded-full font-mono uppercase border transition-colors duration-200 ${style.bg} ${sizeClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot} ${pulse ? 'living-pulse' : ''}`} />
      <span>{status}</span>
    </span>
  );
};
