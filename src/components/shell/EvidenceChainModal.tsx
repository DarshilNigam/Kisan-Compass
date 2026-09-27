import React, { useState, useMemo } from 'react';
import { useFarm } from '../../context/FarmContext';
import { buildDecisionEvidenceGraph } from '../../services/evidenceGraph';
import { buildCalculationTrace } from '../../services/calculationTrace';
import { EvidenceNode, CalculationTraceStep } from '../../types/evidence';
import { 
  GitCommit, 
  Database, 
  Eye, 
  Zap, 
  Calculator, 
  CheckCircle2, 
  ArrowRight, 
  Layers, 
  Sparkles,
  ChevronRight,
  Info
} from 'lucide-react';

interface EvidenceChainModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenProvenance?: (sourceId: string) => void;
  onOpenStressTest?: () => void;
}

export const EvidenceChainModal: React.FC<EvidenceChainModalProps> = ({
  isOpen,
  onClose,
  onOpenProvenance,
  onOpenStressTest,
}) => {
  const { state, snapshot, forecast, setSelectedProvenance } = useFarm();
  const [selectedNode, setSelectedNode] = useState<EvidenceNode | null>(null);
  const [activeCalcStep, setActiveCalcStep] = useState<CalculationTraceStep | null>(null);

  const graph = useMemo(() => {
    return buildDecisionEvidenceGraph(state, snapshot, forecast);
  }, [state, snapshot, forecast]);

  const calculationTrace = useMemo(() => {
    return buildCalculationTrace(state, state.preferences.riskAversion);
  }, [state]);

  if (!isOpen) return null;

  const handleNodeClick = (node: EvidenceNode) => {
    setSelectedNode(node);
    if (node.actionTarget === 'SHOW_CALCULATION') {
      const step = calculationTrace.find(c => c.id === node.actionPayload) || calculationTrace[0];
      setActiveCalcStep(step);
    } else if (node.actionTarget === 'SHOW_PROVENANCE') {
      if (onOpenProvenance && node.actionPayload) {
        onOpenProvenance(node.actionPayload);
      } else {
        setSelectedProvenance({
          status: node.status === 'LIVE' ? 'LIVE' : 'CACHED',
          sourceName: node.label,
          provider: node.source || 'Standard Provider',
          fetchedAt: node.freshness || '12m ago',
          ageMinutes: 12,
          confidence: node.confidence || 0.90,
          usedBy: ['Decision Pipeline', 'Evidence Chain'],
          isFallback: node.status !== 'LIVE',
        });
      }
    } else if (node.actionTarget === 'SHOW_STRESS_TEST') {
      if (onOpenStressTest) onOpenStressTest();
    }
  };

  const getNodeIcon = (type: EvidenceNode['type']) => {
    switch (type) {
      case 'SOURCE': return Database;
      case 'OBSERVATION': return Eye;
      case 'SIGNAL': return Zap;
      case 'CALCULATION': return Calculator;
      case 'DECISION': return CheckCircle2;
      case 'ACTION': return ArrowRight;
      case 'EVALUATION': return GitCommit;
      default: return Layers;
    }
  };

  const getNodeBadgeColor = (type: EvidenceNode['type']) => {
    switch (type) {
      case 'SOURCE': return 'bg-blue-100 text-blue-900 border-blue-200';
      case 'OBSERVATION': return 'bg-cyan-100 text-cyan-900 border-cyan-200';
      case 'SIGNAL': return 'bg-amber-100 text-amber-900 border-amber-200';
      case 'CALCULATION': return 'bg-purple-100 text-purple-900 border-purple-200';
      case 'DECISION': return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      case 'ACTION': return 'bg-zinc-900 text-white border-zinc-700';
      case 'EVALUATION': return 'bg-violet-100 text-violet-900 border-violet-200';
      default: return 'bg-zinc-100 text-zinc-800 border-zinc-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-[#FCFAF6] border border-[#E3DCB8] rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-b from-[#FAF6EB] to-[#FCFAF6] border-b border-[#E8E1C5] flex items-start justify-between gap-4 sticky top-0 z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-900 text-white font-mono text-[10px] font-bold tracking-wider uppercase">
                <GitCommit className="w-3 h-3 text-emerald-300" />
                Decision Evidence Graph
              </span>
              <span className="text-zinc-300">•</span>
              <span className="text-[10px] font-mono text-zinc-600 font-semibold uppercase">
                Deterministic Lineage Map
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-900 tracking-tight font-sans">
              End-to-End Decision Evidence Chain
            </h2>
            <p className="text-xs text-zinc-600">
              Interactive trace from numerical weather forecasts and APMC modal benchmarks down to final combine harvest execution.
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white border border-zinc-200 text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 flex items-center justify-center text-sm font-bold transition-all shadow-xs"
          >
            ✕
          </button>
        </div>

        {/* Narrative Summary Strip */}
        <div className="px-6 py-3 bg-emerald-50/80 border-b border-emerald-100 flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
          <p className="text-xs text-emerald-950 font-sans leading-relaxed">
            <span className="font-bold">Grounded Synthesis: </span>
            {graph.summaryNarrative}
          </p>
        </div>

        {/* Modal Body: Left Vertical Schematic Graph + Right Detail Inspector */}
        <div className="p-5 sm:p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-12 gap-6 flex-1 text-zinc-800">
          
          {/* Left Column: Vertical Graph (7 cols) */}
          <div className="md:col-span-7 space-y-3">
            <div className="text-[11px] font-mono uppercase text-zinc-500 font-bold">
              Lineage Nodes (Click any node to inspect calculation or provenance)
            </div>

            <div className="space-y-2 relative before:absolute before:left-5 before:top-4 before:bottom-4 before:w-0.5 before:bg-zinc-200">
              {graph.nodes.map((node) => {
                const Icon = getNodeIcon(node.type);
                const isSelected = selectedNode?.id === node.id;

                return (
                  <div
                    key={node.id}
                    onClick={() => handleNodeClick(node)}
                    className={`relative z-10 p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected 
                        ? 'bg-white border-emerald-700 shadow-md ring-2 ring-emerald-700/20' 
                        : 'bg-white/90 border-zinc-200/90 hover:border-zinc-300 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${getNodeBadgeColor(node.type)}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold uppercase ${getNodeBadgeColor(node.type)}`}>
                            {node.type}
                          </span>
                          <span className="text-[9px] font-mono text-zinc-400">
                            {node.epistemicCategory}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-zinc-900 font-sans mt-0.5">
                          {node.label}
                        </h4>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs font-bold font-mono text-zinc-900">{node.value}</div>
                      {node.unit && <div className="text-[10px] font-mono text-zinc-500">{node.unit}</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Node Inspector & Calculation Trace (5 cols) */}
          <div className="md:col-span-5 space-y-4">
            <div className="p-4 rounded-2xl bg-white border border-zinc-200 shadow-xs space-y-3 sticky top-4">
              <div className="pb-2 border-b border-zinc-100 flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-zinc-500 font-bold">
                  Node Inspector & Trace
                </span>
                {selectedNode && (
                  <span className="text-[10px] font-mono font-bold text-emerald-800">
                    ID: {selectedNode.id}
                  </span>
                )}
              </div>

              {selectedNode ? (
                <div className="space-y-3 text-xs">
                  <div>
                    <h4 className="font-bold text-zinc-900 text-sm font-sans">{selectedNode.label}</h4>
                    <p className="text-zinc-600 text-xs mt-1 leading-relaxed">{selectedNode.details}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-100 space-y-1.5 font-mono text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Epistemic Status:</span>
                      <span className="font-bold text-zinc-800">{selectedNode.epistemicCategory}</span>
                    </div>
                    {selectedNode.source && (
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Source:</span>
                        <span className="font-bold text-zinc-800">{selectedNode.source}</span>
                      </div>
                    )}
                    {selectedNode.freshness && (
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Latency:</span>
                        <span className="font-bold text-zinc-800">{selectedNode.freshness}</span>
                      </div>
                    )}
                  </div>

                  {/* Calculation Trace Detail Card if Calculation Step is Active */}
                  {activeCalcStep && selectedNode.type === 'CALCULATION' && (
                    <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-200 space-y-2 text-xs">
                      <div className="flex items-center gap-1.5 font-mono font-bold text-purple-950 text-[11px]">
                        <Calculator className="w-3.5 h-3.5 text-purple-700" />
                        <span>{activeCalcStep.title}</span>
                      </div>
                      
                      <div className="font-mono text-[11px] bg-white p-2 rounded-lg border border-purple-100 text-purple-900">
                        {activeCalcStep.formulaText}
                      </div>

                      <div className="text-[11px] font-mono text-zinc-700">
                        <span className="text-zinc-500">Evaluated: </span>
                        <span className="font-bold text-zinc-900">{activeCalcStep.intermediateMath}</span>
                        <span className="font-bold text-emerald-900 block mt-0.5">= {activeCalcStep.outputValue} {activeCalcStep.outputUnit}</span>
                      </div>

                      <p className="text-[11px] text-zinc-600 font-sans">
                        {activeCalcStep.interpretation}
                      </p>
                    </div>
                  )}

                  {selectedNode.actionTarget && (
                    <button
                      onClick={() => handleNodeClick(selectedNode)}
                      className="w-full py-2 px-3 rounded-xl bg-emerald-900 text-white font-mono text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-emerald-950 transition-colors shadow-xs"
                    >
                      <span>INSPECT {selectedNode.actionTarget.replace('SHOW_', '')}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ) : (
                <div className="py-8 text-center text-zinc-400 space-y-2">
                  <Info className="w-8 h-8 mx-auto text-zinc-300" />
                  <p className="text-xs">Click any node on the left to inspect its deterministic derivation and telemetry.</p>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#FAF6EB] border-t border-[#E8E1C5] flex items-center justify-between text-xs font-mono">
          <div className="text-zinc-600">
            Kisan Compass Lineage Engine • Zero LLM Hallucinations
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-emerald-900 text-white font-bold hover:bg-emerald-950 transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
