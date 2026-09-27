import React from 'react';
import { 
  ExecutionPlan, 
  ExecutionStepStatus, 
  VerificationOrigin 
} from '../../types/execution';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Truck, 
  CloudRain, 
  Layers, 
  TrendingUp, 
  ShieldCheck, 
  ChevronRight,
  CircleDot
} from 'lucide-react';

interface ExecutionChecklistProps {
  plan: ExecutionPlan;
  onAdvanceStep: (stepId: string, newStatus: 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED', evidenceText: string) => void;
}

export const ExecutionChecklist: React.FC<ExecutionChecklistProps> = ({
  plan,
  onAdvanceStep,
}) => {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'PRE_HARVEST': return CloudRain;
      case 'HARVEST': return Layers;
      case 'LOGISTICS': return Truck;
      case 'MANDI': return TrendingUp;
      case 'FINANCIAL': return ShieldCheck;
      default: return CircleDot;
    }
  };

  const getStatusBadge = (status: ExecutionStepStatus) => {
    switch (status) {
      case 'COMPLETED':
        return { label: 'COMPLETED', bg: 'bg-emerald-100 text-emerald-900 border-emerald-300' };
      case 'IN_PROGRESS':
        return { label: 'IN PROGRESS', bg: 'bg-blue-100 text-blue-900 border-blue-300 animate-pulse' };
      case 'CONFIRMED':
        return { label: 'CONFIRMED', bg: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
      case 'READY':
        return { label: 'READY', bg: 'bg-zinc-100 text-zinc-700 border-zinc-200' };
      case 'BLOCKED':
        return { label: 'BLOCKED', bg: 'bg-rose-100 text-rose-900 border-rose-300 font-bold' };
      default:
        return { label: 'NOT STARTED', bg: 'bg-zinc-50 text-zinc-500 border-zinc-200' };
    }
  };

  const getOriginBadge = (origin: VerificationOrigin) => {
    switch (origin) {
      case 'FARMER_CONFIRMED':
        return { label: 'FARMER CONFIRMED', color: 'text-emerald-800 bg-emerald-50 border-emerald-200' };
      case 'SYSTEM_OBSERVED':
        return { label: 'SYSTEM OBSERVED', color: 'text-blue-800 bg-blue-50 border-blue-200' };
      case 'EXTERNAL_SOURCE_VERIFIED':
        return { label: 'EXTERNAL VERIFIED', color: 'text-purple-800 bg-purple-50 border-purple-200' };
      case 'SIMULATED':
        return { label: 'SIMULATED', color: 'text-amber-800 bg-amber-50 border-amber-300 font-bold' };
      default:
        return { label: 'UNVERIFIED', color: 'text-zinc-600 bg-zinc-100 border-zinc-200' };
    }
  };

  const completedCount = plan.steps.filter(s => s.status === 'COMPLETED').length;
  const confirmedCount = plan.steps.filter(s => s.status === 'CONFIRMED').length;

  return (
    <div className="space-y-4">
      {/* Progress Glance Bar */}
      <div className="p-4 rounded-2xl bg-white border border-zinc-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-extrabold text-emerald-950 uppercase tracking-wider">
              {plan.title}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-mono text-[10px] font-bold">
              v{plan.version}.0
            </span>
          </div>
          <div className="text-[11px] font-mono text-zinc-500 mt-0.5">
            Target Window: {plan.timeWindowHours}h • Deadline: {plan.deadlineTimestamp}
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="font-bold text-emerald-950">{completedCount}/{plan.steps.length} Steps Completed</span>
          <span className="text-zinc-300">•</span>
          <span className="text-zinc-600">{confirmedCount} Confirmed</span>
        </div>
      </div>

      {/* 10-Step Operational Checklist */}
      <div className="space-y-3">
        {plan.steps.map((step) => {
          const Icon = getCategoryIcon(step.category);
          const statusBadge = getStatusBadge(step.status);
          const originBadge = getOriginBadge(step.verificationOrigin);
          const isTransportUnverified = step.id === 'STEP-03' && step.status === 'NOT_STARTED';

          return (
            <div 
              key={step.id}
              className={`p-4 rounded-2xl border transition-all space-y-3 ${
                step.status === 'COMPLETED' 
                  ? 'bg-emerald-50/40 border-emerald-200' 
                  : step.status === 'IN_PROGRESS'
                  ? 'bg-blue-50/40 border-blue-300 shadow-sm ring-1 ring-blue-300'
                  : isTransportUnverified
                  ? 'bg-amber-50/50 border-amber-300 ring-1 ring-amber-300'
                  : 'bg-white border-zinc-200/80 shadow-xs'
              }`}
            >
              {/* Step Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                    step.status === 'COMPLETED'
                      ? 'bg-emerald-600 text-white'
                      : step.status === 'IN_PROGRESS'
                      ? 'bg-blue-600 text-white'
                      : isTransportUnverified
                      ? 'bg-amber-500 text-white'
                      : 'bg-zinc-100 text-zinc-700'
                  }`}>
                    {step.status === 'COMPLETED' ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <Icon className="w-4 h-4" />
                    )}
                  </div>

                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase">
                        STEP {String(step.stepNumber).padStart(2, '0')}
                      </span>
                      <span className="text-zinc-300">•</span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-mono border ${statusBadge.bg}`}>
                        {statusBadge.label}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-mono border ${originBadge.color}`}>
                        {originBadge.label}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-zinc-900 font-sans">
                      {step.title}
                    </h4>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono text-zinc-500">
                    <Clock className="w-3 h-3 text-zinc-400" />
                    ~{step.estimatedDurationMinutes}m
                  </span>
                </div>
              </div>

              {/* Description & Role */}
              <p className="text-xs text-zinc-600 leading-relaxed pl-11">
                {step.description}
              </p>

              {/* Specific Warning for Transport Step */}
              {isTransportUnverified && (
                <div className="ml-11 p-3 rounded-xl bg-amber-100/70 border border-amber-300 text-xs space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-amber-950 font-sans">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                    <span>Transport Availability: Not Verified</span>
                  </div>
                  <p className="text-[11px] text-amber-900 leading-relaxed font-sans">
                    KISAN COMPASS has an estimated freight rate (₹1,340) but does not currently have a confirmed truck booking. Please confirm your vehicle reservation.
                  </p>
                  <button
                    onClick={() => onAdvanceStep(step.id, 'CONFIRMED', 'Manual confirmation: Trolley reserved with local driver at ₹1,340 tariff.')}
                    className="mt-1 px-3 py-1.5 rounded-lg bg-amber-700 hover:bg-amber-800 text-white font-mono text-[11px] font-bold shadow-xs transition-colors flex items-center gap-1"
                  >
                    <span>Mark Transport Confirmed</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              )}

              {/* Verification Evidence Footnote */}
              {step.verificationEvidence && (
                <div className="ml-11 pt-2 border-t border-zinc-100 text-[11px] font-mono text-emerald-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                  <span>Verified: {step.verificationEvidence} ({step.verifiedAt})</span>
                </div>
              )}

              {/* Action Buttons for In-Progress / Pending Steps */}
              {step.status !== 'COMPLETED' && !isTransportUnverified && (
                <div className="ml-11 flex items-center gap-2 pt-1">
                  {step.status === 'NOT_STARTED' && (
                    <button
                      onClick={() => onAdvanceStep(step.id, 'CONFIRMED', `Farmer confirmed readiness for ${step.title}`)}
                      className="px-3 py-1 rounded-lg bg-zinc-100 hover:bg-emerald-100 border border-zinc-300 hover:border-emerald-300 text-zinc-800 font-mono text-[11px] font-bold transition-all"
                    >
                      Confirm Step
                    </button>
                  )}
                  {step.status === 'CONFIRMED' && (
                    <button
                      onClick={() => onAdvanceStep(step.id, 'IN_PROGRESS', `Execution initiated for ${step.title}`)}
                      className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-mono text-[11px] font-bold transition-all"
                    >
                      Begin Step
                    </button>
                  )}
                  {step.status === 'IN_PROGRESS' && (
                    <button
                      onClick={() => onAdvanceStep(step.id, 'COMPLETED', `Successfully concluded ${step.title}`)}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-900 hover:bg-emerald-950 text-white font-mono text-[11px] font-bold transition-all flex items-center gap-1 shadow-xs"
                    >
                      <CheckCircle2 className="w-3 h-3 text-emerald-300" />
                      <span>Mark Completed</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
