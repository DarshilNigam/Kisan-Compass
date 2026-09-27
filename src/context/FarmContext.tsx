import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { FarmState, DecisionRecord } from '../types/farm';
import { IntelligenceSnapshot, SourceMetadata } from '../types/intelligence';
import { ProbabilisticForecast, StructuredDecisionExplanation } from '../types/forecast';
import { 
  DecisionExplanationContext, 
  GroundedExplanation, 
  GroundedAnswer, 
  GroundedQuestionType, 
  ExplanationLanguage 
} from '../types/explanation';
import { 
  LongitudinalDecisionRecord, 
  ForecastCalibrationStats, 
  RejectionReasonType 
} from '../types/memory';
import { 
  FarmWatchState, 
  DecisionReassessmentRecord 
} from '../types/farmWatch';
import { 
  ExecutionState 
} from '../types/execution';
import { 
  OutcomeIntelligenceReport 
} from '../types/calibration';
import { 
  EvaluationRun,
  DatasetFilterMode
} from '../types/evaluation';
import { CalibrationEngine } from '../services/calibrationEngine';
import { EvaluationEngine } from '../services/evaluationEngine';
import { initialFarmState } from '../data/seedFarmData';
import { createIntelligenceSnapshot } from '../services/intelligenceFabric';
import { computeDecisionExplanation } from '../services/decisionEngine';
import { 
  buildExplanationContext, 
  generateGroundedExplanation, 
  answerGroundedQuestion 
} from '../services/explanationEngine';
import { 
  ExtendedPreferenceProfile, 
  adaptPreferencesOnAction 
} from '../services/preferenceEngine';
import { 
  OutcomeEntryInput, 
  processOutcomeEntry, 
  computeForecastCalibrationStats 
} from '../services/outcomeService';
import { 
  loadDecisionLedger, 
  saveDecisionLedger, 
  loadStoredPreferences, 
  saveStoredPreferences 
} from '../services/decisionRepository';
import { 
  createInitialFarmWatchState, 
  simulateDecisionChangingEvent, 
  simulateMarketNoiseEvent, 
  resolveReassessment 
} from '../services/temporalIntelligence';
import { evaluateExecutionFeasibility } from '../services/executionFeasibilityEngine';
import { generateExecutionPlan } from '../services/executionPlanEngine';
import { INITIAL_EXECUTION_EVENTS, advanceExecutionStep } from '../services/executionVerificationEngine';
import { evaluateExecutionDeviations } from '../services/deviationEngine';
import { calculateCropAgronomy } from '../services/cropAgronomyService';
import { 
  FarmerProfile, 
  Farm, 
  Field, 
  CropCycle, 
  SoilProfile, 
  FarmerPreferences 
} from '../types/farmerData';
import { FarmRepository, DatabaseConnectionError, getAppMode } from '../services/farmRepository';
import { useAuth } from './AuthContext';

export type NavigationTab = 'compass' | 'field' | 'what-if' | 'markets' | 'decisions';

interface FarmContextType {
  state: FarmState;
  snapshot: IntelligenceSnapshot | null;
  forecast: ProbabilisticForecast | null;
  decisionExplanation: StructuredDecisionExplanation | null;
  explanationContext: DecisionExplanationContext | null;
  groundedExplanation: GroundedExplanation | null;
  isDatabaseUnavailable: boolean;
  databaseErrorMessage: string | null;
  explanationLanguage: ExplanationLanguage;
  setExplanationLanguage: (lang: ExplanationLanguage) => void;
  askGroundedQuestion: (qType: GroundedQuestionType) => GroundedAnswer;
  
  // Longitudinal Memory & Preference State
  longitudinalDecisions: LongitudinalDecisionRecord[];
  extendedPreferences: ExtendedPreferenceProfile;
  calibrationStats: ForecastCalibrationStats;
  activeReplayDecision: LongitudinalDecisionRecord | null;
  setActiveReplayDecision: (dec: LongitudinalDecisionRecord | null) => void;
  recordDecisionAction: (decisionId: string, action: 'ACCEPTED' | 'REJECTED', reason?: RejectionReasonType, notes?: string) => void;
  recordOutcome: (input: OutcomeEntryInput) => void;
  
  // Stage 8 Continuous Farm Watch
  watchState: FarmWatchState;
  simulateWeatherShift: (targetRainProb?: number) => void;
  simulateMarketNoise: (deltaInr?: number) => void;
  resetBaseline: () => void;
  acceptUpdatedDecision: (reassessment: DecisionReassessmentRecord) => void;
  keepPreviousDecision: (reassessment: DecisionReassessmentRecord) => void;
  dismissReassessment: (reassessment: DecisionReassessmentRecord) => void;

  // Stage 9 Field Execution Intelligence
  executionState: ExecutionState;
  advanceStep: (stepId: string, newStatus: 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED', evidenceText: string) => void;
  simulateTransportConfirmation: () => void;
  simulateHarvestStart: () => void;
  simulateHarvestComplete: () => void;
  simulateDispatch: () => void;
  simulateMandiSale: (price?: number, qty?: number, freight?: number) => void;
  simulateFullHarvestSequence: () => void;
  resetExecutionState: () => void;

  // Stage 10 Outcome Calibration & Self-Auditing
  outcomeReport: OutcomeIntelligenceReport;
  isOutcomeModalOpen: boolean;
  setIsOutcomeModalOpen: (open: boolean) => void;
  simulateOutcomeScenario: (scenario: 'INSIDE_RANGE' | 'BELOW_P10' | 'ABOVE_P90' | 'FREIGHT_SURGE') => void;
  applyCalibrationSuggestion: (suggestionId: string) => void;
  dismissCalibrationSuggestion: (suggestionId: string) => void;
  resetCalibrationReport: () => void;

  // Stage 11 Evaluation Lab & Reproducibility
  evaluationRun: EvaluationRun;
  runV1Evaluation: EvaluationRun;
  evaluationFilterMode: DatasetFilterMode;
  setEvaluationFilterMode: (mode: DatasetFilterMode) => void;
  isEvaluationLabOpen: boolean;
  setIsEvaluationLabOpen: (open: boolean) => void;

  // Stage 12 Field-Grade Truth Layer & Judge Mode
  isDecisionProofOpen: boolean;
  setIsDecisionProofOpen: (open: boolean) => void;
  isJudgeModeOpen: boolean;
  setIsJudgeModeOpen: (open: boolean) => void;
  isSystemIntegrityOpen: boolean;
  setIsSystemIntegrityOpen: (open: boolean) => void;

  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  showIntro: boolean;
  setShowIntro: (show: boolean) => void;
  selectedSimulationDay: number;
  setSelectedSimulationDay: (day: number) => void;
  selectedProvenance: SourceMetadata | null;
  setSelectedProvenance: (meta: SourceMetadata | null) => void;
  acceptDecision: (decisionId: string) => void;
  rejectDecision: (decisionId: string, reason: DecisionRecord['rejectionReason']) => void;
  toggleApiFailure: (apiName: keyof FarmState['systemStatus']) => void;
  updateRiskPreference: (newRiskAversion: number) => void;
  refreshIntelligence: () => Promise<void>;
  isLoadingIntelligence: boolean;

  // Multi-Tenant Real Farmer Data & Location State
  farmerProfile: FarmerProfile | null;
  farms: Farm[];
  activeFarm: Farm | null;
  fields: Field[];
  activeField: Field | null;
  activeCropCycle: CropCycle | null;
  activeSoilProfile: SoilProfile | null;
  farmerPreferences: FarmerPreferences | null;
  isDemoMode: boolean;
  isOnboardingModalOpen: boolean;
  setIsOnboardingModalOpen: (open: boolean) => void;
  toggleDemoMode: (enable?: boolean) => void;
  switchField: (fieldId: string) => void;
  reloadFarmerData: () => Promise<void>;
}

const FarmContext = createContext<FarmContextType | undefined>(undefined);

export const FarmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();

  const [state, setState] = useState<FarmState>(initialFarmState);
  const [snapshot, setSnapshot] = useState<IntelligenceSnapshot | null>(null);
  const [activeTab, setActiveTab] = useState<NavigationTab>('compass');
  const [showIntro, setShowIntro] = useState<boolean>(true);
  const [selectedSimulationDay, setSelectedSimulationDay] = useState<number>(0);
  const [selectedProvenance, setSelectedProvenance] = useState<SourceMetadata | null>(null);
  const [isLoadingIntelligence, setIsLoadingIntelligence] = useState<boolean>(false);
  const [explanationLanguage, setExplanationLanguage] = useState<ExplanationLanguage>('en');

  // Multi-Tenant Real Farmer Data & Location State
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState<boolean>(false);
  const [isDatabaseUnavailable, setIsDatabaseUnavailable] = useState<boolean>(false);
  const [databaseErrorMessage, setDatabaseErrorMessage] = useState<string | null>(null);
  const [farmerProfile, setFarmerProfile] = useState<FarmerProfile | null>(null);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [activeFarm, setActiveFarm] = useState<Farm | null>(null);
  const [fields, setFields] = useState<Field[]>([]);
  const [activeField, setActiveField] = useState<Field | null>(null);
  const [activeCropCycle, setActiveCropCycle] = useState<CropCycle | null>(null);
  const [activeSoilProfile, setActiveSoilProfile] = useState<SoilProfile | null>(null);
  const [farmerPreferences, setFarmerPreferences] = useState<FarmerPreferences | null>(null);

  // Stage 5 Persistent Memory State
  const [longitudinalDecisions, setLongitudinalDecisions] = useState<LongitudinalDecisionRecord[]>(() => loadDecisionLedger());
  const [extendedPreferences, setExtendedPreferences] = useState<ExtendedPreferenceProfile>(() => loadStoredPreferences());
  const [activeReplayDecision, setActiveReplayDecision] = useState<LongitudinalDecisionRecord | null>(null);

  // Stage 8 Farm Watch State
  const [watchState, setWatchState] = useState<FarmWatchState>(() => createInitialFarmWatchState(initialFarmState));

  // Stage 9 Execution Intelligence State
  const [executionState, setExecutionState] = useState<ExecutionState>(() => {
    const feasibility = evaluateExecutionFeasibility(initialFarmState);
    const plan = generateExecutionPlan(initialFarmState, feasibility);
    const deviations = evaluateExecutionDeviations(plan, {});
    return {
      activePlan: plan,
      feasibility,
      events: INITIAL_EXECUTION_EVENTS,
      deviationReport: deviations,
      currentStepIndex: 1,
      isSimulated: false,
      lastUpdated: '09:15 IST',
    };
  });

  // Stage 10 Outcome Calibration State
  const [outcomeReport, setOutcomeReport] = useState<OutcomeIntelligenceReport>(() => {
    return CalibrationEngine.generateOutcomeReport(loadDecisionLedger());
  });
  const [isOutcomeModalOpen, setIsOutcomeModalOpen] = useState<boolean>(false);

  // Stage 11 Evaluation Lab & Reproducibility State
  const [evaluationFilterMode, setEvaluationFilterMode] = useState<DatasetFilterMode>('INCLUDE_DEMO');
  const [isEvaluationLabOpen, setIsEvaluationLabOpen] = useState<boolean>(false);

  // Stage 12 Field-Grade Truth Layer & Judge Mode State
  const [isDecisionProofOpen, setIsDecisionProofOpen] = useState<boolean>(false);
  const [isJudgeModeOpen, setIsJudgeModeOpen] = useState<boolean>(false);
  const [isSystemIntegrityOpen, setIsSystemIntegrityOpen] = useState<boolean>(false);

  // Historical Run v1 baseline snapshot (built with seed records for deterministic comparison)
  const runV1Evaluation = useMemo(() => {
    return EvaluationEngine.runFullEvaluation(loadDecisionLedger().slice(1), 'INCLUDE_DEMO', 1);
  }, []);

  // Live dynamic Evaluation Run v2
  const evaluationRun = useMemo(() => {
    return EvaluationEngine.runFullEvaluation(longitudinalDecisions, evaluationFilterMode, 2);
  }, [longitudinalDecisions, evaluationFilterMode]);

  // Sync outcome report when decisions update
  useEffect(() => {
    setOutcomeReport(CalibrationEngine.generateOutcomeReport(longitudinalDecisions));
  }, [longitudinalDecisions]);

  // Sync to localStorage on update
  useEffect(() => {
    saveDecisionLedger(longitudinalDecisions);
  }, [longitudinalDecisions]);

  useEffect(() => {
    saveStoredPreferences(extendedPreferences);
    setState(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        riskAversion: extendedPreferences.riskAversion,
        weatherSensitivity: extendedPreferences.weatherSensitivity,
        storageTrust: extendedPreferences.storageTrust,
        cashUrgency: extendedPreferences.cashUrgency,
        lastAdjustedDecisionId: extendedPreferences.lastAdjustedDecisionId,
        adjustmentSummary: extendedPreferences.adjustmentSummary,
      }
    }));
  }, [extendedPreferences]);

  // Load real multi-tenant farmer data on login
  const reloadFarmerData = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setFarmerProfile(null);
      setFarms([]);
      setActiveFarm(null);
      setFields([]);
      setActiveField(null);
      setActiveCropCycle(null);
      setActiveSoilProfile(null);
      setFarmerPreferences(null);
      return;
    }

    try {
      setIsDatabaseUnavailable(false);
      setDatabaseErrorMessage(null);
      const data = await FarmRepository.getCurrentFarmState(user.id);
      if (data && data.farmer && data.activeFarm && data.activeField) {
        setFarmerProfile(data.farmer);
        setFarms(data.farms);
        setActiveFarm(data.activeFarm);
        setFields(data.fields);
        setActiveField(data.activeField);
        setActiveCropCycle(data.activeCropCycle);
        setActiveSoilProfile(data.soilProfile);
        setFarmerPreferences(data.preferences);
        setIsOnboardingModalOpen(false);

        const agronomy = calculateCropAgronomy(
          data.activeCropCycle?.crop_name,
          data.activeCropCycle?.sowing_date,
          data.activeCropCycle?.crop_stage
        );

        // Update core FarmState to reflect active farmer's field & crop
        setState(prev => ({
          ...prev,
          farmerName: data.farmer!.full_name,
          farmId: data.activeFarm!.id,
          fieldId: data.activeField!.id,
          fieldName: data.activeField!.field_name,
          crop: data.activeCropCycle?.crop_name || 'Wheat',
          variety: data.activeCropCycle?.crop_variety || 'Field Standard',
          areaAcres: data.activeField!.area_acres,
          estimatedHarvestQuintals: data.activeCropCycle?.quantity_quintals || 25,
          sowingDate: data.activeCropCycle?.sowing_date || prev.sowingDate,
          cropStage: agronomy.cropStage,
          gddAccumulated: agronomy.gddAccumulated,
          gddTarget: agronomy.gddTarget,
          estimatedHarvestWindow: agronomy.harvestWindow,
          location: {
            ...prev.location,
            village: data.activeFarm!.village,
            district: data.activeFarm!.district,
            state: data.activeFarm!.state,
            coordinates: [
              data.activeField!.latitude || data.activeFarm!.latitude, 
              data.activeField!.longitude || data.activeFarm!.longitude
            ],
          },
          soil: {
            ...prev.soil,
            ph: data.soilProfile?.ph || prev.soil.ph,
            organicCarbon: data.soilProfile?.organic_carbon || prev.soil.organicCarbon,
            source: data.soilProfile?.has_test ? 'Farmer Soil Card' : 'Regional Reference',
            telemetry: data.soilProfile?.has_test ? 'LIVE' : 'CACHED',
          }
        }));
      } else {
        // Authenticated user with no farm/field yet: prompt onboarding!
        if (!isDemoMode) {
          setIsOnboardingModalOpen(true);
        }
      }
    } catch (err: any) {
      console.error('[FarmContext] Error loading farmer state:', err);
      if (getAppMode() === 'production' || err instanceof DatabaseConnectionError) {
        setIsDatabaseUnavailable(true);
        setDatabaseErrorMessage(err?.message || 'DATABASE CONNECTION UNAVAILABLE: Your farm data could not be securely loaded.');
      }
    }
  }, [isAuthenticated, user, isDemoMode]);

  useEffect(() => {
    if (isAuthenticated && user) {
      reloadFarmerData();
    }
  }, [isAuthenticated, user?.id, reloadFarmerData]);

  // Switch between fields owned by the farmer
  const switchField = useCallback(async (fieldId: string) => {
    if (isDemoMode) return;
    const target = fields.find(f => f.id === fieldId);
    if (!target || !user) return;
    setActiveField(target);

    try {
      const cycles = await FarmRepository.getCropCyclesByField(user.id, target.id);
      const activeCycle = cycles.find(c => c.status === 'ACTIVE') || cycles[0] || null;
      setActiveCropCycle(activeCycle);

      const soil = await FarmRepository.getSoilProfileByField(user.id, target.id);
      setActiveSoilProfile(soil);

      const agronomy = calculateCropAgronomy(
        activeCycle?.crop_name,
        activeCycle?.sowing_date,
        activeCycle?.crop_stage
      );

      setState(prev => ({
        ...prev,
        fieldId: target.id,
        fieldName: target.field_name,
        crop: activeCycle?.crop_name || 'Wheat',
        variety: activeCycle?.crop_variety || 'Field Standard',
        areaAcres: target.area_acres,
        estimatedHarvestQuintals: activeCycle?.quantity_quintals || 25,
        sowingDate: activeCycle?.sowing_date || prev.sowingDate,
        cropStage: agronomy.cropStage,
        gddAccumulated: agronomy.gddAccumulated,
        gddTarget: agronomy.gddTarget,
        estimatedHarvestWindow: agronomy.harvestWindow,
        location: {
          ...prev.location,
          coordinates: [target.latitude || prev.location.coordinates[0], target.longitude || prev.location.coordinates[1]],
        },
      }));
    } catch (e) {
      console.error('[FarmContext] Error switching field:', e);
    }
  }, [fields, isDemoMode, user]);

  // Toggle between real user data and isolated demo benchmark dataset
  const toggleDemoMode = useCallback((enable?: boolean) => {
    const nextMode = enable !== undefined ? enable : !isDemoMode;
    setIsDemoMode(nextMode);

    if (nextMode) {
      setState(initialFarmState);
      setWatchState(createInitialFarmWatchState(initialFarmState));
      setIsOnboardingModalOpen(false);
    } else {
      reloadFarmerData();
    }
  }, [isDemoMode, reloadFarmerData]);

  const refreshIntelligence = useCallback(async () => {
    setIsLoadingIntelligence(true);
    try {
      const lat = isDemoMode ? 26.5123 : (activeField?.latitude ?? activeFarm?.latitude ?? state.location.coordinates[0]);
      const lon = isDemoMode ? 80.2452 : (activeField?.longitude ?? activeFarm?.longitude ?? state.location.coordinates[1]);
      const cropName = isDemoMode ? 'Wheat' : (activeCropCycle?.crop_name ?? state.crop ?? 'Wheat');
      const quantityQuintals = isDemoMode 
        ? 32 
        : (activeCropCycle?.quantity_quintals && activeCropCycle.quantity_quintals > 0 
            ? activeCropCycle.quantity_quintals 
            : (state.estimatedHarvestQuintals > 0 ? state.estimatedHarvestQuintals : 25));

      const snap = await createIntelligenceSnapshot({
        weatherFail: !state.systemStatus.weatherApiOnline,
        marketFail: !state.systemStatus.marketFeedOnline,
        soilFail: !state.systemStatus.soilCatalogOnline,
        forecastFail: !state.systemStatus.forecastEngineOnline,
        lat,
        lon,
        cropName,
        quantityQuintals,
        soilProfile: isDemoMode || !activeSoilProfile ? null : {
          source_type: activeSoilProfile.has_test ? 'USER_PROVIDED' : 'REGIONAL_REFERENCE',
          ph: activeSoilProfile.ph,
          organic_carbon_pct: activeSoilProfile.organic_carbon,
          lab_name: activeSoilProfile.has_test ? 'Laboratory Soil Card' : undefined,
        },
      });

      setSnapshot(snap);

      // Sync state with live normalized snapshot
      setState((prev) => {
        const liveWeather = snap.weather;
        const liveMarket = snap.market;
        const optimalMandi = liveMarket.destinations.find(d => d.isOptimal) || liveMarket.destinations[0];
        const grossVal = (optimalMandi ? optimalMandi.grossPricePerQuintal : liveMarket.modalPrice) * quantityQuintals;
        const netExpected = optimalMandi ? optimalMandi.totalNetRealization : (grossVal - Math.round(200 + 25 * 38 + quantityQuintals * 12));

        const dynamicSimulations = snap.forecast?.quantiles.map(q => ({
          dayOffset: q.horizonDays,
          date: q.date,
          expectedPrice: q.p50Price,
          p10Price: q.p10Price,
          p90Price: q.p90Price,
          rainRisk: q.weatherDownsidePenalty > 0 ? (liveWeather.precipitationProbability48h || 68) : (liveWeather.precipitationProbability48h || 12),
          storageDegradationCost: q.spoilageExposurePenalty,
          netRealizationExpected: q.p50NetRealization,
          netRealizationP10: q.p10NetRealization,
          netRealizationP90: q.p90NetRealization,
          recommendationAction: q.recommendedAction,
        })) || prev.activeScenarioSimulation;

        return {
          ...prev,
          estimatedHarvestQuintals: quantityQuintals,
          weather: {
            ...prev.weather,
            currentTemp: liveWeather.currentTemp,
            currentHumidity: liveWeather.relativeHumidity,
            rainfallProbability48h: liveWeather.precipitationProbability48h,
            rainRiskWindowDays: liveWeather.stormFrontWindowDays,
            forecast: liveWeather.forecast7d,
            lastUpdated: `${liveWeather.metadata.ageMinutes}m ago`,
            source: liveWeather.metadata.sourceName,
            telemetry: liveWeather.metadata.status,
          },
          market: {
            ...prev.market,
            modalPrice: liveMarket.modalPrice,
            priceTrend7d: liveMarket.priceTrend7d,
            destinations: liveMarket.destinations,
            telemetry: liveMarket.metadata.status,
          },
          activeScenarioSimulation: dynamicSimulations,
          currentDecision: {
            ...prev.currentDecision,
            confidence: snap.overallConfidence,
            expectedFinancials: {
              expectedValueInr: netExpected,
              rangeMinInr: snap.forecast?.quantiles[0]?.p10NetRealization || Math.round(netExpected * 0.94),
              rangeMaxInr: snap.forecast?.quantiles[0]?.p90NetRealization || Math.round(netExpected * 1.05),
            },
            primaryRecommendation: `Initiate harvest within optimal window. Route ${quantityQuintals} qtl to ${optimalMandi?.name || 'mandi'} to lock in ₹${netExpected.toLocaleString('en-IN')}.`,
          },
        };
      });
    } catch (err) {
      console.error('[FarmContext] Intelligence fabric refresh error:', err);
    } finally {
      setIsLoadingIntelligence(false);
    }
  }, [
    state.systemStatus.weatherApiOnline, 
    state.systemStatus.marketFeedOnline, 
    state.systemStatus.soilCatalogOnline,
    state.systemStatus.forecastEngineOnline,
    isDemoMode,
    activeField,
    activeCropCycle,
    activeFarm,
    state.crop,
    state.estimatedHarvestQuintals,
    state.location.coordinates,
    ]);

  useEffect(() => {
    refreshIntelligence();
  }, [refreshIntelligence]);

  // Synchronize Farm Watch and Execution Plan whenever the field, crop, or quantity changes
  useEffect(() => {
    setWatchState(createInitialFarmWatchState(state));
    const feasibility = evaluateExecutionFeasibility(state);
    const plan = generateExecutionPlan(state, feasibility);
    const deviations = evaluateExecutionDeviations(plan, {});
    setExecutionState({
      activePlan: plan,
      feasibility,
      events: INITIAL_EXECUTION_EVENTS,
      deviationReport: deviations,
      currentStepIndex: 1,
      isSimulated: false,
      lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
  }, [state.fieldId, state.crop, state.estimatedHarvestQuintals, state.fieldName]);

  const forecast = snapshot?.forecast || null;

  // Compute live structured decision explanation dynamically
  const decisionExplanation = useMemo(() => {
    if (!forecast) return null;
    const optimalMandi = state.market.destinations.find(d => d.isOptimal) || state.market.destinations[0];
    return computeDecisionExplanation(forecast, selectedSimulationDay, extendedPreferences, {
      batchQuintals: state.estimatedHarvestQuintals,
      destinationMandi: optimalMandi?.name,
      distanceKm: optimalMandi?.distanceKm,
    });
  }, [forecast, selectedSimulationDay, extendedPreferences, state.estimatedHarvestQuintals, state.market.destinations]);

  // Build grounded explanation context
  const explanationContext = useMemo(() => {
    return buildExplanationContext(state, forecast, selectedSimulationDay);
  }, [state, forecast, selectedSimulationDay]);

  // Generate grounded explanation with bilingual & failure fallback support
  const groundedExplanation = useMemo(() => {
    if (!explanationContext) return null;
    return generateGroundedExplanation(
      explanationContext,
      explanationLanguage,
      !state.systemStatus.explanationEngineOnline
    );
  }, [explanationContext, explanationLanguage, state.systemStatus.explanationEngineOnline]);

  const askGroundedQuestion = useCallback((qType: GroundedQuestionType): GroundedAnswer => {
    const ctx = explanationContext || buildExplanationContext(state, forecast, selectedSimulationDay);
    return answerGroundedQuestion(qType, ctx, explanationLanguage);
  }, [explanationContext, state, forecast, selectedSimulationDay, explanationLanguage]);

  // Stage 5 Action Recorder: updates decision ledger + adapts farmer preferences
  const recordDecisionAction = useCallback((
    decisionId: string,
    action: 'ACCEPTED' | 'REJECTED',
    reason?: RejectionReasonType,
    notes?: string
  ) => {
    let targetDecision: LongitudinalDecisionRecord | undefined;

    setLongitudinalDecisions(prev => {
      const updated = prev.map(dec => {
        if (dec.id === decisionId) {
          targetDecision = dec;
          const updatedDec: LongitudinalDecisionRecord = {
            ...dec,
            farmerAction: action,
            rejectionReason: reason,
            rejectionNotes: notes,
            preferenceDeltaApplied: reason === 'TOO_RISKY' 
              ? 'Risk aversion raised +0.08, weather risk sensitivity increased.' 
              : reason === 'NEED_IMMEDIATE_CASH'
              ? 'Liquidity preference raised +0.12.'
              : action === 'ACCEPTED'
              ? 'Confirmed current decision utility weighting.'
              : 'Preference adjusted.',
          };
          return updatedDec;
        }
        return dec;
      });
      return updated;
    });

    // Adapt preferences deterministically
    setExtendedPreferences(prev => {
      return adaptPreferencesOnAction(prev, action, reason, targetDecision);
    });

    // Also sync currentDecision state
    setState(prev => {
      if (prev.currentDecision.id !== decisionId) return prev;
      const updatedDecision: DecisionRecord = {
        ...prev.currentDecision,
        farmerAction: action,
        rejectionReason: reason as any,
      };
      return {
        ...prev,
        currentDecision: updatedDecision,
        decisionHistory: [updatedDecision, ...prev.decisionHistory.filter(d => d.id !== decisionId)],
      };
    });
  }, []);

  // Stage 5 Outcome Recorder: records verified harvest outcome
  const recordOutcome = useCallback((input: OutcomeEntryInput) => {
    setLongitudinalDecisions(prev => {
      return prev.map(dec => {
        if (dec.id === input.decisionId) {
          const outcomeReport = processOutcomeEntry(input, dec);
          return {
            ...dec,
            actualOutcome: outcomeReport,
            outcomeStatus: 'CONFIRMED' as const,
          };
        }
        return dec;
      });
    });
  }, []);

  // Compute live forecast calibration statistics
  const calibrationStats = useMemo(() => {
    return computeForecastCalibrationStats(longitudinalDecisions);
  }, [longitudinalDecisions]);

  const acceptDecision = useCallback((decisionId: string) => {
    recordDecisionAction(decisionId, 'ACCEPTED');
  }, [recordDecisionAction]);

  const rejectDecision = useCallback((decisionId: string, reason: DecisionRecord['rejectionReason'] = 'TOO_RISKY') => {
    recordDecisionAction(decisionId, 'REJECTED', reason as RejectionReasonType);
  }, [recordDecisionAction]);

  const toggleApiFailure = (apiName: keyof FarmState['systemStatus']) => {
    if (apiName === 'lastHeartbeat') return;
    setState((prev) => {
      const isCurrentlyOnline = prev.systemStatus[apiName];
      const isNowOnline = !isCurrentlyOnline;

      return {
        ...prev,
        systemStatus: {
          ...prev.systemStatus,
          [apiName]: isNowOnline,
          lastHeartbeat: 'Just now',
        },
      };
    });
  };

  const updateRiskPreference = (newRiskAversion: number) => {
    setExtendedPreferences(prev => ({
      ...prev,
      riskAversion: newRiskAversion,
      dimensions: prev.dimensions.map(d => 
        d.dimension === 'riskAversion' ? { ...d, currentScore: newRiskAversion } : d
      ),
    }));
  };

  // Stage 8 Farm Watch Simulation & Resolution Handlers
  const simulateWeatherShift = useCallback((targetRainProb: number = 37) => {
    const { updatedState, updatedWatchState } = simulateDecisionChangingEvent(state, watchState, targetRainProb);
    setState(updatedState);
    setWatchState(updatedWatchState);
  }, [state, watchState]);

  const simulateMarketNoise = useCallback((deltaInr: number = 15) => {
    const { updatedState, updatedWatchState } = simulateMarketNoiseEvent(state, watchState, deltaInr);
    setState(updatedState);
    setWatchState(updatedWatchState);
  }, [state, watchState]);

  const resetBaseline = useCallback(() => {
    setState(initialFarmState);
    setWatchState(createInitialFarmWatchState(initialFarmState));
  }, []);

  const acceptUpdatedDecision = useCallback((reassessment: DecisionReassessmentRecord) => {
    const resolved = resolveReassessment(watchState, reassessment, 'ACCEPTED_NEW');
    setWatchState(resolved);
    
    // Update active decision in state and memory
    setState(prev => ({
      ...prev,
      currentDecision: {
        ...prev.currentDecision,
        action: reassessment.newRecommendation as any,
        farmerAction: 'ACCEPTED',
        primaryRecommendation: reassessment.whyHeadline,
        expectedFinancials: {
          ...prev.currentDecision.expectedFinancials,
          expectedValueInr: reassessment.newExpectedNet,
        }
      }
    }));

    recordDecisionAction(reassessment.decisionId, 'ACCEPTED', undefined, `Accepted reassessed recommendation (${reassessment.newRecommendation})`);
  }, [watchState, recordDecisionAction]);

  const keepPreviousDecision = useCallback((reassessment: DecisionReassessmentRecord) => {
    const resolved = resolveReassessment(watchState, reassessment, 'KEPT_PREVIOUS');
    setWatchState(resolved);
  }, [watchState]);

  const dismissReassessment = useCallback((reassessment: DecisionReassessmentRecord) => {
    const resolved = resolveReassessment(watchState, reassessment, 'DISMISSED');
    setWatchState(resolved);
  }, [watchState]);

  // Stage 9 Execution Step Handlers
  const advanceStep = useCallback((stepId: string, newStatus: 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED', evidenceText: string) => {
    setExecutionState(prev => {
      const { updatedPlan, event } = advanceExecutionStep(prev.activePlan, stepId, newStatus, 'FARMER_CONFIRMED', evidenceText);
      const updatedFeasibility = evaluateExecutionFeasibility(state);
      const updatedDeviations = evaluateExecutionDeviations(updatedPlan, {});
      return {
        ...prev,
        activePlan: updatedPlan,
        feasibility: updatedFeasibility,
        events: [event, ...prev.events],
        deviationReport: updatedDeviations,
        lastUpdated: 'Just now',
      };
    });
  }, [state]);

  const simulateTransportConfirmation = useCallback(() => {
    setExecutionState(prev => {
      const { updatedPlan, event } = advanceExecutionStep(
        prev.activePlan, 
        'STEP-03', 
        'CONFIRMED', 
        'SIMULATED', 
        'Simulated vehicle reservation: 35 qtl trolley confirmed for Field 07 (Agreed tariff: ₹1,340).'
      );
      return {
        ...prev,
        activePlan: updatedPlan,
        events: [event, ...prev.events],
        isSimulated: true,
        lastUpdated: 'Just now',
      };
    });
  }, []);

  const simulateHarvestStart = useCallback(() => {
    setExecutionState(prev => {
      const { updatedPlan, event } = advanceExecutionStep(
        prev.activePlan, 
        'STEP-05', 
        'IN_PROGRESS', 
        'SIMULATED', 
        'Simulated field operation: 2 cutting crews initiated harvest on Field 07.'
      );
      return {
        ...prev,
        activePlan: updatedPlan,
        events: [event, ...prev.events],
        isSimulated: true,
        lastUpdated: 'Just now',
      };
    });
  }, []);

  const simulateHarvestComplete = useCallback(() => {
    setExecutionState(prev => {
      let currentPlan = prev.activePlan;
      const res1 = advanceExecutionStep(
        currentPlan, 
        'STEP-05', 
        'COMPLETED', 
        'SIMULATED', 
        'Field cutting concluded. 32 quintals biomass harvested.'
      );
      currentPlan = res1.updatedPlan;
      const res2 = advanceExecutionStep(
        currentPlan, 
        'STEP-06', 
        'COMPLETED', 
        'SIMULATED', 
        'Grain threshed, winnowed, and bagged into 64 standard 50kg bags.'
      );
      currentPlan = res2.updatedPlan;
      const res3 = advanceExecutionStep(
        currentPlan, 
        'STEP-07', 
        'COMPLETED', 
        'SIMULATED', 
        '64 bags loaded onto transport trolley with weather-proof lashings.'
      );
      return {
        ...prev,
        activePlan: res3.updatedPlan,
        events: [res3.event, res2.event, res1.event, ...prev.events],
        isSimulated: true,
        lastUpdated: 'Just now',
      };
    });
  }, []);

  const simulateDispatch = useCallback(() => {
    setExecutionState(prev => {
      const { updatedPlan, event } = advanceExecutionStep(
        prev.activePlan, 
        'STEP-08', 
        'COMPLETED', 
        'SIMULATED', 
        'Trolley dispatched to Unnao Mandi (28 km via NH-27, transit time 1.2 hours).'
      );
      return {
        ...prev,
        activePlan: updatedPlan,
        events: [event, ...prev.events],
        isSimulated: true,
        lastUpdated: 'Just now',
      };
    });
  }, []);

  const simulateMandiSale = useCallback((price: number = 2350, qty: number = 32, freight: number = 1420) => {
    setExecutionState(prev => {
      let currentPlan = prev.activePlan;
      const res1 = advanceExecutionStep(
        currentPlan, 
        'STEP-09', 
        'COMPLETED', 
        'SIMULATED', 
        'Arrived at Unnao APMC yard. Registered lot #UN-889 for afternoon auction.'
      );
      currentPlan = res1.updatedPlan;
      const res2 = advanceExecutionStep(
        currentPlan, 
        'STEP-10', 
        'COMPLETED', 
        'SIMULATED', 
        `Auction concluded at ₹${price}/qtl (${qty} qtl). Net proceeds: ₹${(price * qty - freight).toLocaleString('en-IN')}.`
      );
      currentPlan = res2.updatedPlan;

      const deviations = evaluateExecutionDeviations(currentPlan, {
        actualPricePerQuintal: price,
        actualQuantityQuintals: qty,
        actualFreightInr: freight,
      });

      return {
        ...prev,
        activePlan: currentPlan,
        events: [res2.event, res1.event, ...prev.events],
        deviationReport: deviations,
        isSimulated: true,
        lastUpdated: 'Just now',
      };
    });

    // Record verified outcome in Decision Memory
    recordOutcome({
      decisionId: state.currentDecision.id,
      salePricePerQuintal: price,
      quantityQuintals: qty,
      mandi: 'Unnao APMC',
      saleDate: '2026-03-27',
      transportCost: freight,
      otherDeductions: 0,
      farmerNotes: 'Stage 9 Verified Auction Settlement (Unnao e-NAM Yard)',
    });
  }, [state, recordOutcome]);

  const simulateFullHarvestSequence = useCallback(() => {
    simulateTransportConfirmation();
    setTimeout(() => simulateHarvestStart(), 300);
    setTimeout(() => simulateHarvestComplete(), 600);
    setTimeout(() => simulateDispatch(), 900);
    setTimeout(() => simulateMandiSale(2350, 32, 1420), 1200);
  }, [simulateTransportConfirmation, simulateHarvestStart, simulateHarvestComplete, simulateDispatch, simulateMandiSale]);

  const resetExecutionState = useCallback(() => {
    const feasibility = evaluateExecutionFeasibility(state);
    const plan = generateExecutionPlan(state, feasibility);
    const deviations = evaluateExecutionDeviations(plan, {});
    setExecutionState({
      activePlan: plan,
      feasibility,
      events: INITIAL_EXECUTION_EVENTS,
      deviationReport: deviations,
      currentStepIndex: 1,
      isSimulated: false,
      lastUpdated: '09:15 IST',
    });
  }, [state]);

  // Stage 10 Outcome Calibration Handlers
  const simulateOutcomeScenario = useCallback((scenario: 'INSIDE_RANGE' | 'BELOW_P10' | 'ABOVE_P90' | 'FREIGHT_SURGE') => {
    let realizedPrice = 2420;
    let realizedFreight = 1350;
    let notes = 'Simulated realization inside normal P10–P90 uncertainty cone.';

    if (scenario === 'BELOW_P10') {
      realizedPrice = 2050;
      realizedFreight = 1380;
      notes = 'Simulated market slump below P10 due to surprise mandi arrival volume.';
    } else if (scenario === 'ABOVE_P90') {
      realizedPrice = 2880;
      realizedFreight = 1320;
      notes = 'Simulated demand rally above P90 due to miller supply shortage.';
    } else if (scenario === 'FREIGHT_SURGE') {
      realizedPrice = 2380;
      realizedFreight = 1950;
      notes = 'Simulated +45% freight cost surge due to diesel hike and driver scarcity.';
    }

    const simDecId = `DEC-SIM-${Date.now().toString().slice(-4)}`;
    const actualGross = 32 * realizedPrice;
    const actualNet = actualGross - realizedFreight;
    const simRecord: LongitudinalDecisionRecord = {
      id: simDecId,
      timestamp: new Date().toISOString(),
      fieldId: 'FIELD-07',
      fieldName: 'North Plot (Field 07)',
      crop: 'Wheat',
      cropVariety: 'HD-2967 High Yield',
      stage: 'Late maturity',
      recommendation: 'SELL NOW',
      recommendedHorizonDays: 0,
      title: 'Simulated Harvest Settlement',
      primaryRecommendation: 'Pre-storm liquidation at Unnao Mandi',
      farmerAction: 'ACCEPTED',
      forecast: {
        p10: 68500,
        p50: 74820,
        p90: 79200,
        horizonDays: 0,
        modelName: 'Chronos-Bolt Quantile Engine',
        source: 'LIVE_MODEL',
        generatedAt: '12:00 IST',
      },
      expectedNetRealization: 74820,
      outcomeStatus: 'CONFIRMED',
      weatherSnapshot: {
        condition: 'Clear',
        currentTemp: 31,
        rainfallProbability48h: 68,
        rainRiskLevel: 'HIGH',
        stormWindowDays: 2,
        source: 'Open-Meteo Ensemble',
      },
      marketSnapshot: {
        mandi: 'Unnao Mandi (APMC)',
        grossPricePerQuintal: 2380,
        netRealizationPerQuintal: 2338.12,
        distanceKm: 28.4,
        totalNetRealization: 74820,
        source: 'AGMARKNET Daily APMC Feed',
      },
      preferenceSnapshot: {
        riskAversion: 0.68,
        weatherSensitivity: 0.82,
        liquidityPreference: 0.55,
        priceUpsidePreference: 0.42,
      },
      reasoningFactors: [],
      confidence: 85,
      actualOutcome: {
        salePricePerQuintal: realizedPrice,
        quantityQuintals: 32,
        mandi: 'Unnao Mandi (APMC)',
        saleDate: new Date().toISOString().split('T')[0],
        transportCost: realizedFreight,
        otherDeductions: 0,
        actualGrossInr: actualGross,
        actualNetInr: actualNet,
        deltaVsExpectedNetInr: actualNet - 74820,
        classification: scenario === 'BELOW_P10' ? 'BELOW_P10' : scenario === 'ABOVE_P90' ? 'ABOVE_P90' : 'WITHIN_RANGE',
        reportedAt: 'Just now',
        farmerNotes: notes,
      },
    };

    setLongitudinalDecisions(prev => [simRecord, ...prev]);
  }, []);

  const applyCalibrationSuggestion = useCallback((suggestionId: string) => {
    setOutcomeReport(prev => {
      const updatedSuggestions = prev.calibrationSuggestions.map(sug => {
        if (sug.id === suggestionId) {
          return { ...sug, status: 'APPLIED' as const };
        }
        return sug;
      });

      return {
        ...prev,
        calibrationSuggestions: updatedSuggestions,
        overallVerdict: `System adopted parameter adjustment (${suggestionId}). Mathematical models now reflect farmer-approved boundaries.`,
      };
    });
  }, []);

  const dismissCalibrationSuggestion = useCallback((suggestionId: string) => {
    setOutcomeReport(prev => {
      const updatedSuggestions = prev.calibrationSuggestions.map(sug => {
        if (sug.id === suggestionId) {
          return { ...sug, status: 'DISMISSED' as const };
        }
        return sug;
      });

      return {
        ...prev,
        calibrationSuggestions: updatedSuggestions,
      };
    });
  }, []);

  const resetCalibrationReport = useCallback(() => {
    const baseline = loadDecisionLedger();
    setLongitudinalDecisions(baseline);
    setOutcomeReport(CalibrationEngine.generateOutcomeReport(baseline));
  }, []);

  return (
    <FarmContext.Provider
      value={{
        state,
        snapshot,
        forecast,
        decisionExplanation,
        explanationContext,
        groundedExplanation,
        explanationLanguage,
        setExplanationLanguage,
        askGroundedQuestion,
        
        longitudinalDecisions,
        extendedPreferences,
        calibrationStats,
        activeReplayDecision,
        setActiveReplayDecision,
        recordDecisionAction,
        recordOutcome,

        // Stage 8 Continuous Farm Watch
        watchState,
        simulateWeatherShift,
        simulateMarketNoise,
        resetBaseline,
        acceptUpdatedDecision,
        keepPreviousDecision,
        dismissReassessment,

        // Stage 9 Field Execution Intelligence
        executionState,
        advanceStep,
        simulateTransportConfirmation,
        simulateHarvestStart,
        simulateHarvestComplete,
        simulateDispatch,
        simulateMandiSale,
        simulateFullHarvestSequence,
        resetExecutionState,

        // Stage 10 Outcome Calibration & Self-Auditing
        outcomeReport,
        isOutcomeModalOpen,
        setIsOutcomeModalOpen,
        simulateOutcomeScenario,
        applyCalibrationSuggestion,
        dismissCalibrationSuggestion,
        resetCalibrationReport,

        // Stage 11 Evaluation Lab & Reproducibility
        evaluationRun,
        runV1Evaluation,
        evaluationFilterMode,
        setEvaluationFilterMode,
        isEvaluationLabOpen,
        setIsEvaluationLabOpen,

        // Stage 12 Field-Grade Truth Layer & Judge Mode
        isDecisionProofOpen,
        setIsDecisionProofOpen,
        isJudgeModeOpen,
        setIsJudgeModeOpen,
        isSystemIntegrityOpen,
        setIsSystemIntegrityOpen,

        activeTab,
        setActiveTab,
        showIntro,
        setShowIntro,
        selectedSimulationDay,
        setSelectedSimulationDay,
        selectedProvenance,
        setSelectedProvenance,
        acceptDecision,
        rejectDecision,
        toggleApiFailure,
        updateRiskPreference,
        refreshIntelligence,
        isLoadingIntelligence,

        // Multi-Tenant Real Farmer Data & Location State
        farmerProfile,
        farms,
        activeFarm,
        fields,
        activeField,
        activeCropCycle,
        activeSoilProfile,
        farmerPreferences,
        isDemoMode,
        isOnboardingModalOpen,
        setIsOnboardingModalOpen,
        isDatabaseUnavailable,
        databaseErrorMessage,
        toggleDemoMode,
        switchField,
        reloadFarmerData,
      }}
    >
      {children}
    </FarmContext.Provider>
  );
};

export const useFarm = () => {
  const context = useContext(FarmContext);
  if (!context) {
    throw new Error('useFarm must be used within a FarmProvider');
  }
  return context;
};
