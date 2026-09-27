/**
 * KISAN COMPASS — Main Application Root
 * 
 * Implements the Rain AI Central Wheel Navigation Experience:
 * 1. Intro sequence (unmodified, preserved exactly as requested)
 * 2. Pre-Auth Landing: Asymmetric wheel (left) + feature explanation glass card (right)
 * 3. FeatureAuthGate: Direct embedded glass auth surface with honest account validation
 * 4. Authenticated Landing: Strictly centered KisanWheel operating system with NO explanation card
 * 5. Feature Domain Pages: Spatial transition into Field, Decision, Market, Memory, and Trust
 * 6. "← KISAN COMPASS" back-to-wheel spatial control
 */

import React, { useState } from 'react';
import { FarmProvider, useFarm } from './context/FarmContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AtmosphericOverlay } from './components/spatial/AtmosphericOverlay';
import { AmbientPointerLight } from './components/spatial/AmbientPointerLight';
import { IntroSequence } from './components/shell/IntroSequence';
import { ProvenanceDrawer } from './components/shell/ProvenanceDrawer';
import { OutcomeIntelligenceCenter } from './components/shell/OutcomeIntelligenceCenter';
import { EvaluationLab } from './components/shell/EvaluationLab';
import { DecisionProofModal } from './components/shell/DecisionProofModal';
import { JudgeModeModal } from './components/shell/JudgeModeModal';
import { FeatureId } from './config/features';
import { PreAuthLanding } from './components/landing/PreAuthLanding';
import { AuthenticatedLanding } from './components/landing/AuthenticatedLanding';
import { FeaturePageShell } from './components/shell/FeaturePageShell';
import { FarmerOnboardingModal } from './components/onboarding/FarmerOnboardingModal';
import { FarmRepository, DatabaseConnectionError, getAppMode } from './services/farmRepository';
import { supabase, isSupabaseConfigured } from './services/supabaseClient';
import { FieldView } from './components/views/FieldView';
import { DecisionView } from './components/views/DecisionView';
import { MarketsView } from './components/views/MarketsView';
import { DecisionsView } from './components/views/DecisionsView';
import { TrustView } from './components/views/TrustView';
import { AnimatePresence, motion } from 'framer-motion';

const MainAppContent: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const { 
    showIntro, 
    setShowIntro, 
    selectedProvenance, 
    setSelectedProvenance,
    outcomeReport,
    isOutcomeModalOpen,
    setIsOutcomeModalOpen,
    simulateOutcomeScenario,
    applyCalibrationSuggestion,
    dismissCalibrationSuggestion,
    resetCalibrationReport,
    evaluationRun,
    runV1Evaluation,
    evaluationFilterMode,
    setEvaluationFilterMode,
    isEvaluationLabOpen,
    setIsEvaluationLabOpen,
    isDecisionProofOpen,
    setIsDecisionProofOpen,
    isJudgeModeOpen,
    setIsJudgeModeOpen,
    isOnboardingModalOpen,
    setIsOnboardingModalOpen,
    isDatabaseUnavailable,
    databaseErrorMessage,
    reloadFarmerData
  } = useFarm();

  // Active view state: 'wheel' represents the centered home compass
  const [currentView, setCurrentView] = useState<FeatureId | 'wheel'>('wheel');

  const renderFeatureContent = (featureId: FeatureId) => {
    switch (featureId) {
      case 'field':
        return <FieldView key="field" onNavigateToDecision={() => setCurrentView('decision')} />;
      case 'decision':
        return <DecisionView key="decision" />;
      case 'market':
        return <MarketsView key="market" />;
      case 'memory':
        return <DecisionsView key="memory" />;
      case 'trust':
        return <TrustView key="trust" />;
      default:
        return <FieldView key="field" onNavigateToDecision={() => setCurrentView('decision')} />;
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-x-hidden bg-[#F7F4EC] text-[#17281F]">
      
      {/* Intro sequence on first load (preserved exactly) */}
      {showIntro && <IntroSequence onComplete={() => setShowIntro(false)} />}

      {/* Atmospheric Spatial Livening & Subtle Pointer Light */}
      <AtmosphericOverlay />
      <AmbientPointerLight />

      {/* Production Database Error Boundary / Unavailable Screen */}
      {isDatabaseUnavailable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#17281F]/60 backdrop-blur-md">
          <div className="max-w-md w-full bg-[#FFFFFF] rounded-2xl p-8 border-2 border-[#D94E34]/40 shadow-2xl text-center">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[#FCE8E6] flex items-center justify-center text-[#D94E34]">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-[#17281F] tracking-wide mb-2 uppercase">
              DATABASE CONNECTION UNAVAILABLE
            </h2>
            <p className="text-sm text-[#4A5D4E] font-medium leading-relaxed mb-6">
              Your farm data could not be securely loaded.
              <br />
              Please try again.
            </p>
            {databaseErrorMessage && (
              <div className="p-3 mb-6 bg-[#F9F7F1] border border-[#E2D8C3] rounded-lg text-xs font-mono text-[#6E5534] text-left break-words">
                {databaseErrorMessage}
              </div>
            )}
            <button
              onClick={() => reloadFarmerData()}
              className="w-full py-3 px-6 bg-[#2D5A27] hover:bg-[#23471F] text-white font-semibold rounded-xl shadow-md transition-all active:scale-[0.98]"
            >
              Retry Connection
            </button>
          </div>
        </div>
      )}

      {/* Data Source Provenance Audit Modal */}
      {selectedProvenance && (
        <ProvenanceDrawer
          metadata={selectedProvenance}
          onClose={() => setSelectedProvenance(null)}
        />
      )}

      {/* Stage 10 Outcome Intelligence & Calibration Modal */}
      {isOutcomeModalOpen && (
        <OutcomeIntelligenceCenter
          isOpen={isOutcomeModalOpen}
          onClose={() => setIsOutcomeModalOpen(false)}
          report={outcomeReport}
          onSimulateOutcome={simulateOutcomeScenario}
          onApplySuggestion={applyCalibrationSuggestion}
          onDismissSuggestion={dismissCalibrationSuggestion}
          onResetCalibration={resetCalibrationReport}
        />
      )}

      {/* Stage 11 Evidence-Grounded Evaluation Lab & Reproducibility Modal */}
      {isEvaluationLabOpen && (
        <EvaluationLab
          isOpen={isEvaluationLabOpen}
          onClose={() => setIsEvaluationLabOpen(false)}
          currentRun={evaluationRun}
          runV1={runV1Evaluation}
          filterMode={evaluationFilterMode}
          onFilterModeChange={setEvaluationFilterMode}
        />
      )}

      {/* Stage 12 One Decision, Full Proof Lineage Modal */}
      {isDecisionProofOpen && (
        <DecisionProofModal
          isOpen={isDecisionProofOpen}
          onClose={() => setIsDecisionProofOpen(false)}
        />
      )}

      {/* Stage 12 Guided Judge Mode Walkthrough Modal */}
      {isJudgeModeOpen && (
        <JudgeModeModal
          isOpen={isJudgeModeOpen}
          onClose={() => setIsJudgeModeOpen(false)}
        />
      )}

      {/* Step-by-Step Multi-Tenant Farmer Onboarding Modal */}
      {isOnboardingModalOpen && isAuthenticated && (
        <FarmerOnboardingModal
          initialName={user?.name || ''}
          onCancel={() => setIsOnboardingModalOpen(false)}
          onComplete={async (data) => {
            if (!user) {
              throw new Error('No active farmer account session found. Please sign in again.');
            }
            try {
              // Resolve active Supabase user ID if available
              let authUserId = user.id;
              if (isSupabaseConfigured && supabase) {
                const { data: sessionData } = await supabase.auth.getSession();
                if (sessionData?.session?.user?.id) {
                  authUserId = sessionData.session.user.id;
                } else if (getAppMode() === 'production') {
                  throw new DatabaseConnectionError(
                    'Active Supabase session required: You are currently not signed in with a verified Supabase account. Please sign in or confirm your email to save your profile to the database.'
                  );
                }
              }

              // 1. Profile
              const profile = await FarmRepository.saveFarmerProfile({
                id: `farmer_${Date.now()}`,
                auth_user_id: authUserId,
                full_name: data.farmer.fullName,
                phone: data.farmer.phone,
                preferred_language: data.farmer.language,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              });

              // 2. Farm
              const farm = await FarmRepository.createFarm(authUserId, {
                farmer_id: profile.id,
                farm_name: data.farm.farmName,
                village: data.farm.village,
                district: data.farm.district,
                state: data.farm.state,
                latitude: data.farm.latitude,
                longitude: data.farm.longitude,
                location_source: data.farm.locationSource,
                location_accuracy: data.farm.locationAccuracy,
              });

              // 3. Field
              const field = await FarmRepository.createField(authUserId, {
                farm_id: farm.id,
                field_name: data.field.fieldName,
                area_acres: data.field.areaAcres,
                area_unit: data.field.areaUnit,
                latitude: data.farm.latitude,
                longitude: data.farm.longitude,
                location_source: data.farm.locationSource,
              });

              // 4. Crop Cycle
              await FarmRepository.createCropCycle(authUserId, {
                field_id: field.id,
                crop_name: data.crop.cropName,
                crop_variety: data.crop.cropVariety,
                sowing_date: data.crop.sowingDate,
                sowing_date_precision: data.crop.sowingPrecision,
                crop_stage: data.crop.cropStage,
                quantity_quintals: data.crop.quantityQuintals,
                quantity_unit: data.crop.quantityUnit,
                quantity_status: data.crop.quantityStatus,
                status: 'ACTIVE',
              });

              // 5. Soil Profile (honest data: laboratory or regional reference)
              if (data.soil.hasTest) {
                await FarmRepository.saveSoilProfile(authUserId, {
                  field_id: field.id,
                  has_test: true,
                  ph: data.soil.ph,
                  moisture_percentage: data.soil.moisture,
                  nitrogen_kg_ha: data.soil.nitrogen,
                  phosphorus_kg_ha: data.soil.phosphorus,
                  potassium_kg_ha: data.soil.potassium,
                  organic_carbon: data.soil.organicCarbon,
                  source: 'USER_TEST',
                });
              }

              // 6. Preferences
              await FarmRepository.savePreferences(authUserId, {
                farmer_id: profile.id,
                risk_posture: data.preferences.riskPosture,
                immediate_cash_weight: data.preferences.riskPosture === 'SAFER' ? 0.8 : 0.4,
                weather_risk_aversion: data.preferences.riskPosture === 'SAFER' ? 0.85 : 0.5,
              });

              setIsOnboardingModalOpen(false);
              await reloadFarmerData();
            } catch (err: any) {
              console.error('Error saving onboarding data:', err);
              throw err;
            }
          }}
        />
      )}

      {/* Main Interaction Canvas */}
      <div className="relative z-20 flex-1">
        <AnimatePresence mode="wait">
          {!isAuthenticated ? (
            // State 1: Unauthenticated Landing (Wheel on Left, Explanation Card on Right)
            <motion.div
              key="pre-auth"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <PreAuthLanding
                onAuthenticatedNavigate={(_targetFeatureId) => {
                  setCurrentView('wheel');
                }}
              />
            </motion.div>
          ) : currentView === 'wheel' ? (
            // State 2: Authenticated Landing (Centered Wheel with NO explanation card)
            <motion.div
              key="auth-wheel"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.04 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <AuthenticatedLanding
                onEnterFeature={(featureId) => setCurrentView(featureId)}
                onOpenJudgeMode={() => setIsJudgeModeOpen(true)}
              />
            </motion.div>
          ) : (
            // State 3: Feature Domain Page (with ← KISAN COMPASS back navigation)
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            >
              <FeaturePageShell
                featureId={currentView}
                onBackToWheel={() => setCurrentView('wheel')}
                onNavigateToFeature={(fId) => setCurrentView(fId)}
              >
                {renderFeatureContent(currentView)}
              </FeaturePageShell>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <FarmProvider>
        <MainAppContent />
      </FarmProvider>
    </AuthProvider>
  );
};

export default App;
