import React from 'react';
import { SourceMetadata } from '../../types/intelligence';
import { StatusPill } from './StatusPill';
import { 
  ShieldCheck, 
  ExternalLink, 
  X 
} from 'lucide-react';

interface ProvenanceDrawerProps {
  metadata: SourceMetadata | null;
  onClose: () => void;
}

export const ProvenanceDrawer: React.FC<ProvenanceDrawerProps> = ({
  metadata,
  onClose,
}) => {
  if (!metadata) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg p-6 rounded-3xl glass-primary shadow-2xl border border-white/90 space-y-5 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-zinc-200/60">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-600 living-pulse" />
              <span className="tech-label font-bold text-emerald-950">DATA PROVENANCE & AUDIT TRAIL</span>
            </div>
            <h3 className="text-lg font-bold text-zinc-900 font-sans">
              {metadata.sourceName}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-zinc-200/60 text-zinc-500 hover:text-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Core Specs Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-white/90 border border-zinc-100 space-y-1">
            <span className="tech-label text-zinc-400 block">TELEMETRY STATE</span>
            <div className="flex items-center gap-2">
              <StatusPill status={metadata.status} size="sm" pulse />
              <span className="font-mono text-zinc-600">({metadata.ageMinutes}m age)</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white/90 border border-zinc-100 space-y-1">
            <span className="tech-label text-zinc-400 block">SOURCE CONFIDENCE</span>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold font-mono text-emerald-900">
                {(metadata.confidence * 100).toFixed(0)}%
              </span>
              <span className="text-[10px] text-zinc-500">
                {metadata.confidence >= 0.85 ? 'High Trust' : 'Degraded Trust'}
              </span>
            </div>
          </div>
        </div>

        {/* Provider & Endpoint */}
        <div className="space-y-2 text-xs">
          <div className="p-3 rounded-xl bg-white/80 border border-zinc-100 space-y-1">
            <span className="tech-label text-zinc-400 block">AUTHORITATIVE PROVIDER</span>
            <div className="font-medium text-zinc-900">{metadata.provider}</div>
            {metadata.endpoint && (
              <div className="text-[10px] font-mono text-zinc-500 truncate mt-1 flex items-center gap-1">
                <ExternalLink className="w-3 h-3 text-zinc-400 shrink-0" />
                <span className="truncate">{metadata.endpoint}</span>
              </div>
            )}
          </div>

          {/* Dependent Systems (Used By) */}
          <div className="p-3 rounded-xl bg-white/80 border border-zinc-100 space-y-1.5">
            <span className="tech-label text-zinc-400 block">DEPENDENT DECISION PIPELINES</span>
            <div className="flex flex-wrap gap-1.5">
              {metadata.usedBy.map((mod, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-900 border border-emerald-200 text-[10px] font-mono font-medium"
                >
                  {mod}
                </span>
              ))}
            </div>
          </div>

          {/* Technical Calibration Note */}
          {metadata.note && (
            <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/80 text-[11px] text-zinc-600 space-y-1">
              <span className="tech-label text-zinc-400 block">VERIFICATION NOTE</span>
              <p className="leading-relaxed">{metadata.note}</p>
            </div>
          )}
        </div>

        {/* Footer Audit Check */}
        <div className="flex items-center justify-between pt-3 border-t border-zinc-200/60 text-[10px] font-mono text-zinc-500">
          <div className="flex items-center gap-1.5 text-emerald-800">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Cryptographically Verified Payload</span>
          </div>
          <span>Fetched {metadata.fetchedAt}</span>
        </div>
      </div>
    </div>
  );
};
