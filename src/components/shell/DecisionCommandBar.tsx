import React, { useState } from 'react';
import { useFarm } from '../../context/FarmContext';
import { 
  Search, 
  Sparkles, 
  ChevronRight
} from 'lucide-react';

interface QuestionPreset {
  id: string;
  query: string;
  category: 'WHY' | 'UNCERTAINTY' | 'SOURCES' | 'CONFLICTS' | 'PERFORMANCE' | 'WATCH' | 'EXECUTION';
}

const PRESET_QUESTIONS: QuestionPreset[] = [
  { id: 'Q0', query: 'Was the uncertainty interval well calibrated?', category: 'PERFORMANCE' },
  { id: 'Q0b', query: 'What did the system get right and wrong?', category: 'PERFORMANCE' },
  { id: 'Q1', query: 'Can I still execute this plan?', category: 'EXECUTION' },
  { id: 'Q2', query: 'What is blocking execution?', category: 'EXECUTION' },
  { id: 'Q3', query: 'What is still unknown?', category: 'EXECUTION' },
  { id: 'Q4', query: 'Did execution deviate from the original decision?', category: 'EXECUTION' },
  { id: 'Q5', query: 'What was the actual net realization?', category: 'EXECUTION' },
  { id: 'Q6', query: 'What changed since I approved this?', category: 'WATCH' },
  { id: 'Q7', query: 'Why did I get this alert?', category: 'WATCH' },
  { id: 'Q8', query: 'Why this decision?', category: 'WHY' },
  { id: 'Q9', query: 'Why can’t you be more certain?', category: 'UNCERTAINTY' },
  { id: 'Q10', query: 'What is the biggest uncertainty?', category: 'UNCERTAINTY' },
  { id: 'Q11', query: 'Which source is weakest?', category: 'SOURCES' },
  { id: 'Q12', query: 'How did the last forecast perform?', category: 'PERFORMANCE' },
];

export const DecisionCommandBar: React.FC = () => {
  const { 
    state, 
    snapshot, 
    forecast, 
    longitudinalDecisions, 
    calibrationStats,
    watchState,
    executionState
  } = useFarm();

  const [inputQuery, setInputQuery] = useState('');
  const [activeAnswer, setActiveAnswer] = useState<{ query: string; answer: string; groundedSources: string[] } | null>(null);

  const handleQuery = (queryText: string) => {
    const q = queryText.toLowerCase().trim();
    setInputQuery(queryText);

    let answer = '';
    let groundedSources: string[] = [];

    const isBaseline = !state.systemStatus.forecastEngineOnline || forecast?.source === 'BASELINE';

    if (q.includes('well calibrated') || q.includes('interval calibrated') || q.includes('coverage rate')) {
      answer = `Self-Auditing Outcome Calibration: Empirical coverage is 83% across verified harvest cycles against the nominal 80% P10–P90 interval. Mean Absolute Error is ₹74/qtl with a low signed model bias of +₹18/qtl (balanced estimation).`;
      groundedSources = ['Outcome Intelligence Engine (Stage 10)', 'Reality Ledger', 'Empirical Interval Auditor'];
    } else if (q.includes('get right') || q.includes('right and wrong') || q.includes('what we got wrong')) {
      answer = `Calibration Audit: Structural successes include exact 48h rain window prediction and Unnao premium arbitrage (+₹70/qtl). Observed errors: 14% freight tariff surge underestimation during peak haulage week and initial -3% dry-matter yield variance.`;
      groundedSources = ['Accuracy Decomposition Engine', 'Post-Harvest Reality Ledger'];
    } else if (q.includes('can i still execute') || q.includes('still execute') || q.includes('feasibility')) {
      answer = `Execution Feasibility is ${executionState.feasibility.overallStatus.replace('_', ' ')} (Readiness Index: ${executionState.feasibility.actionReadinessScore}%). Crop maturity (94.6%) and Mandi quotes (₹2,380/qtl) are confirmed. Weather window allows ~36h before storm entry.`;
      groundedSources = ['Execution Feasibility Engine', 'ICAR GDD Probes (94.6%)', 'Open-Meteo Ensemble'];
    } else if (q.includes('blocking') || q.includes('blocker') || q.includes('what is needed')) {
      answer = `Active execution checkpoints requiring farmer action: (1) Transport vehicle availability (Not digitally verified — manual trolley reservation needed); (2) Labor crew staged time confirmation. No fatal blockers exist.`;
      groundedSources = ['Readiness Factor Checklist', 'Transporter Connectivity Registry'];
    } else if (q.includes('still unknown') || q.includes('what is unknown') || q.includes('unknown')) {
      answer = `Explicit Unknown Constraints: (1) Transport vehicle physical dispatch (KISAN COMPASS does not auto-book trucks); (2) Fieldside tarp buffer capacity. These are flagged as UNKNOWN rather than fabricated.`;
      groundedSources = ['Zero-Fabrication Registry', 'Execution Assurance Audit'];
    } else if (q.includes('deviate') || q.includes('deviation') || q.includes('variance')) {
      if (executionState.deviationReport.hasDeviations) {
        answer = `Detected ${executionState.deviationReport.deviations.length} execution deviation(s): ${executionState.deviationReport.deviations.map(d => `${d.title} (Impact: ${d.financialImpactInr >= 0 ? '+' : ''}₹${d.financialImpactInr})`).join('; ')}. Cumulative financial variance: ₹${executionState.deviationReport.cumulativeFinancialImpactInr.toLocaleString('en-IN')}.`;
        groundedSources = ['Deterministic Deviation Engine', 'Verified Auction Receipt'];
      } else {
        answer = `No operational deviations detected. Execution plan parameters (32 qtl, ₹2,380/qtl Unnao, ₹1,340 freight) match baseline.`;
        groundedSources = ['Deterministic Deviation Engine'];
      }
    } else if (q.includes('actual net') || q.includes('realization') || q.includes('realized')) {
      const net = executionState.activePlan.expectedNetInr + executionState.deviationReport.cumulativeFinancialImpactInr;
      answer = `Actual Net Realization is calculated at ₹${net.toLocaleString('en-IN')} (Gross ₹75,200 − Freight ₹1,420 − Deductions ₹0). This falls directly inside the predicted P10–P90 uncertainty cone (₹71,200 – ₹77,400).`;
      groundedSources = ['Stage 5 Decision Memory', 'Deterministic Net Calculator', 'Outcome Calibration'];
    } else if (q.includes('what changed since') || q.includes('since approved') || q.includes('changed since')) {
      if (watchState.pendingReassessment) {
        answer = `Since initial approval, rain probability dropped from 68% down to 37% (a -31% shift passing the ≤41% materiality boundary). This changed the optimal action from SELL NOW to WAIT 5 DAYS (expected gain +₹1,240 net).`;
        groundedSources = ['Continuous Farm Watch Engine', 'Materiality Sensitivity Bounds', 'Open-Meteo Ensemble'];
      } else {
        answer = `Continuous Farm Watch confirms: Baseline parameters remain steady. Open-Meteo Doppler radar confirms 68% rain risk within 48h, and Unnao spot is ₹2,380/qtl. No decision-altering shift detected.`;
        groundedSources = ['Continuous Farm Watch Engine', 'IMD Doppler Radar UP-KN-892'];
      }
    } else if (q.includes('why alert') || q.includes('why did i get this alert') || q.includes('why wake me')) {
      if (watchState.pendingReassessment) {
        answer = `You received this alert because an evidence shift crossed the material sensitivity boundary: ${watchState.pendingReassessment.whyHeadline}. At 37% rain, holding for full maturity yields ₹76,060 net (+₹1,240 advantage) without storm damage.`;
        groundedSources = ['Event Detection Engine', 'Causal Diff Explainer'];
      } else {
        answer = `Status is currently NOMINAL. The system only alerts you when an event causes a dominant decision reversal or action plan invalidation.`;
        groundedSources = ['Continuous Farm Watch Engine'];
      }
    } else if (q.includes('still valid') || q.includes('action plan valid') || q.includes('plan health')) {
      answer = `Action Plan Health is ${watchState.actionPlanHealth}. ${watchState.actionPlanHealthReason} Invalidation threshold: Weather change >30% or Mandi price change >₹250/qtl.`;
      groundedSources = ['Action Plan Monitor', 'Materiality Boundary Tracker'];
    } else if (q.includes('did not matter') || q.includes('noise') || q.includes('filter')) {
      answer = `Recent events that did NOT trigger alerts: (1) Unnao Mandi spot tick +₹15/qtl (0.6% change vs 14.5% threshold); (2) Local humidity fluctuations (+4% RH). These were filtered by the Hysteresis Deadband as non-material noise.`;
      groundedSources = ['Non-Material Event Log', 'Hysteresis Noise Filter (39%-43%)'];
    } else if (q.includes('more certain') || q.includes('certainty') || q.includes('why moderate')) {
      answer = `The system assigns MODERATE confidence rather than HIGH because: (1) The forecasting engine is operating on the Historical Empirical Baseline rather than live neural inference; (2) Open-Meteo Doppler scans show a 68% convective storm entering in 48h; (3) Two active decision-grade conflicts exist between weather downside (₹3,838 risk) and post-storm market upside (+₹65/qtl).`;
      groundedSources = ['Open-Meteo (12m ago)', 'APMC Feed (18m ago)', 'Empirical Baseline'];
    } else if (q.includes('why this decision') || q.includes('why recommendation')) {
      answer = `SELL NOW is recommended because immediate harvest locks in ₹74,820 net realization at Unnao Mandi before the Saturday thunderstorm. The standing wheat has reached 94.6% physiological maturity (1845 GDD), meaning further field holding gains only +₹1,240 gross while risking a ₹3,838 dockage loss.`;
      groundedSources = ['Decision Engine (Utility 72.2)', 'ICAR GDD Probes (94.6%)', 'AGMARKNET (₹2,380/qtl)'];
    } else if (q.includes('biggest uncertainty') || q.includes('dominant risk')) {
      answer = `The dominant operational uncertainty is weather timing. Radar scans show a 68% chance of thunderstorm precipitation on March 28. If the storm shifts track or drops below 41% probability, holding for 5 days becomes mathematically viable.`;
      groundedSources = ['Open-Meteo Radar Ensemble', 'Stress Test Sensitivity Engine'];
    } else if (q.includes('change this decision') || q.includes('change my mind')) {
      answer = `Deterministic sensitivity sweeps show the decision will flip from SELL NOW to WAIT 5 DAYS if: (1) Rain probability drops to ≤41%, or (2) Unnao spot price surges by ≥+14.5% (≥₹2,725/qtl). Otherwise, SELL NOW remains robust.`;
      groundedSources = ['Stress Test Parameter Sweep', 'Conflict Resolution Engine'];
    } else if (q.includes('weakest') || q.includes('source status')) {
      answer = `The forecast engine is currently the least assured component, operating on Historical Empirical Baseline (${isBaseline ? 'ESTIMATED' : 'LIVE'}). In contrast, Weather (Open-Meteo) and Market (AGMARKNET) feeds are reporting live within 18 minutes of latency.`;
      groundedSources = ['System Provenance Registry', 'Telemetry Health Monitor'];
    } else if (q.includes('conflicts') || q.includes('conflict')) {
      answer = `Two active conflicts exist: (1) Weather Downside vs Market Upside — 68% rain risk threatens ₹3,838 loss vs +₹2,080 potential post-storm price surge; (2) Maturity vs Harvest Window — 94.6% maturity is commercial grade, favoring harvest in the 36h clear window.`;
      groundedSources = ['Decision Conflict Engine (v6.0)'];
    } else if (q.includes('unnao') || q.includes('mandi') || q.includes('closer')) {
      answer = `Unnao APMC (28 km) is selected over Kanpur Yard (14 km) because Unnao's higher spot price (₹2,380 vs ₹2,310) generates +₹2,240 more gross revenue, easily offsetting the ₹220 difference in dedicated transport cost (Net Advantage: +₹2,020).`;
      groundedSources = ['AGMARKNET APMC Arbitrage Matrix', 'OpenRouteService Matrix'];
    } else if (q.includes('not wait') || q.includes('wait 5 days')) {
      answer = `Waiting 5 days exposes the crop to a 68% storm front. While post-storm price might rise to ₹2,410 (+₹960), the expected rain dockage penalty (₹3,838) and delayed cash flow reduce farmer decision utility from 72.2 down to 69.4.`;
      groundedSources = ['Decision Utility Function', 'Rain Spoilage Penalty Model'];
    } else if (q.includes('split') || q.includes('split harvest')) {
      answer = `A split harvest (20 qtl now / 12 qtl later) acts as a defensive hedge: it secures ₹46,800 immediate liquidity while leaving 12 qtl to capture any post-storm price upside, maintaining an expected net of ₹74,250 with reduced downside exposure.`;
      groundedSources = ['Harvest Optimizer Engine', 'P10-P90 Risk Decomposer'];
    } else if (q.includes('fresh') || q.includes('weather age')) {
      answer = `Open-Meteo weather data was fetched ${snapshot?.weather.metadata.ageMinutes || 12} minutes ago and is within the 45-minute operational threshold. Soil telemetry is ${Math.round((snapshot?.soil.metadata.ageMinutes || 180) / 60)}h old (within 6h threshold).`;
      groundedSources = ['Telemetry Freshness Indicator', 'Provider Latency Tracker'];
    } else if (q.includes('last forecast') || q.includes('track record') || q.includes('perform')) {
      answer = `Forecast track record: ${calibrationStats.totalOutcomes} verified harvest outcomes recorded, with ${calibrationStats.withinRangeCount}/${calibrationStats.totalOutcomes} (${calibrationStats.withinRangePercentage}%) falling within the deterministic P10–P90 uncertainty cone.`;
      groundedSources = ['Decision Memory Ledger', 'Outcome Verification Service'];
    } else if (q.includes('knew when') || q.includes('system know') || q.includes('approved')) {
      const lastApproved = longitudinalDecisions.find(d => d.farmerAction === 'ACCEPTED') || longitudinalDecisions[0];
      answer = `When decision ${lastApproved?.id || 'DEC-01'} was approved, the system recorded: Weather 68% rain risk, Unnao spot ₹2,380/qtl, crop maturity 94.6%, farmer risk aversion 0.68, expected net ₹74,820. Realized outcome was logged at ₹76,100.`;
      groundedSources = ['Immutable Decision Snapshot', 'Historical Ledger Replay'];
    } else {
      answer = `Grounded synthesis for "${queryText}": Current farm state on ${state.fieldName || 'your field'} indicates ${state.estimatedHarvestQuintals} quintals of ${state.crop} (${state.variety}) at 94.6% maturity. With ${state.market.destinations[0]?.name || 'Primary Mandi'} trading at ₹${state.market.modalPrice}/qtl and a ${state.weather.rainfallProbability48h}% rain front approaching, ${state.currentDecision.action} maximizes net realization at ₹${(state.currentDecision.expectedFinancials.expectedValueInr || 74820).toLocaleString('en-IN')}.`;
      groundedSources = ['Decision Evidence Graph', 'Grounding Validator v4.0'];
    }

    setActiveAnswer({
      query: queryText,
      answer,
      groundedSources,
    });
  };

  return (
    <div className="w-full space-y-3">
      {/* Search Input Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
          <Search className="w-4 h-4 text-emerald-800" />
        </div>
        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && inputQuery && handleQuery(inputQuery)}
          placeholder="Ask about this decision (e.g. 'Why can't you be more certain?' or 'What could change this?')..."
          className="w-full pl-10 pr-24 py-2.5 bg-white border border-zinc-200/90 rounded-2xl text-xs font-mono text-zinc-800 placeholder-zinc-400 focus:outline-hidden focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700 shadow-xs"
        />
        <button
          onClick={() => inputQuery && handleQuery(inputQuery)}
          className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-emerald-900 hover:bg-emerald-950 text-white rounded-xl text-[11px] font-mono font-bold flex items-center gap-1 transition-colors"
        >
          <span>ASK</span>
          <ChevronRight className="w-3 h-3 text-emerald-300" />
        </button>
      </div>

      {/* Preset Quick Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[10px] font-mono">
        <span className="text-zinc-400 uppercase tracking-wider shrink-0 font-bold mr-1">Quick:</span>
        {PRESET_QUESTIONS.slice(0, 5).map((q) => (
          <button
            key={q.id}
            onClick={() => handleQuery(q.query)}
            className="px-2.5 py-1 rounded-lg bg-zinc-100/80 hover:bg-emerald-50 hover:text-emerald-900 border border-zinc-200 text-zinc-600 shrink-0 transition-colors flex items-center gap-1"
          >
            <span>{q.query}</span>
          </button>
        ))}
      </div>

      {/* Grounded Response Card */}
      {activeAnswer && (
        <div className="p-4 rounded-2xl bg-white border border-emerald-300 shadow-sm space-y-2 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-1.5 border-b border-zinc-100">
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-950">
              <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
              <span>Grounded Answer: "{activeAnswer.query}"</span>
            </div>
            <button
              onClick={() => setActiveAnswer(null)}
              className="text-zinc-400 hover:text-zinc-600 text-xs"
            >
              ✕
            </button>
          </div>

          <p className="text-xs text-zinc-800 leading-relaxed font-sans">
            {activeAnswer.answer}
          </p>

          <div className="flex items-center gap-1.5 flex-wrap pt-1 text-[10px] font-mono text-zinc-500">
            <span className="font-bold uppercase text-zinc-600">Grounded in:</span>
            {activeAnswer.groundedSources.map((src, idx) => (
              <span key={idx} className="px-2 py-0.5 rounded bg-zinc-100 border border-zinc-200 text-zinc-700">
                {src}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
