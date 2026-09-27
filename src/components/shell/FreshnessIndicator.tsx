import React from 'react';
import { TelemetryStatus } from '../../types/farm';

interface FreshnessIndicatorProps {
  status: TelemetryStatus;
  ageMinutes?: number;
  label?: string;
  className?: string;
  onClick?: () => void;
}

export const FreshnessIndicator: React.FC<FreshnessIndicatorProps> = ({
  status,
  ageMinutes,
  label,
  className = '',
  onClick,
}) => {
  const getStyle = () => {
    switch (status) {
      case 'LIVE':
        return {
          dot: 'bg-emerald-500',
          text: 'text-emerald-900',
          bg: 'bg-emerald-500/10 border-emerald-500/20',
          pulse: true,
        };
      case 'FRESH':
        return {
          dot: 'bg-sky-500',
          text: 'text-sky-900',
          bg: 'bg-sky-500/10 border-sky-500/20',
          pulse: false,
        };
      case 'CACHED':
        return {
          dot: 'bg-slate-400',
          text: 'text-slate-700',
          bg: 'bg-slate-500/10 border-slate-400/20',
          pulse: false,
        };
      case 'ESTIMATED':
      case 'DEGRADED':
        return {
          dot: 'bg-amber-500',
          text: 'text-amber-900 font-semibold',
          bg: 'bg-amber-500/15 border-amber-500/30',
          pulse: true,
        };
      case 'OFFLINE':
        return {
          dot: 'bg-rose-500',
          text: 'text-rose-900',
          bg: 'bg-rose-500/10 border-rose-500/20',
          pulse: false,
        };
      default:
        return {
          dot: 'bg-zinc-400',
          text: 'text-zinc-700',
          bg: 'bg-zinc-500/10 border-zinc-400/20',
          pulse: false,
        };
    }
  };

  const style = getStyle();

  const formattedAge = ageMinutes !== undefined 
    ? ageMinutes < 60 
      ? `${ageMinutes}m` 
      : `${Math.floor(ageMinutes / 60)}h` 
    : null;

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono border transition-all ${
        style.bg
      } ${style.text} ${onClick ? 'cursor-pointer hover:brightness-95' : ''} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot} ${style.pulse ? 'living-pulse' : ''}`} />
      {label && <span className="font-bold">{label}</span>}
      <span>{status}</span>
      {formattedAge && (
        <>
          <span className="text-zinc-400">•</span>
          <span className="text-zinc-500 font-normal">{formattedAge}</span>
        </>
      )}
    </div>
  );
};
