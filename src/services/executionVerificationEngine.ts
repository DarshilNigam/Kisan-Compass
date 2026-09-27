import { 
  ExecutionPlan, 
  ExecutionEvent, 
  VerificationOrigin 
} from '../types/execution';

/**
 * Execution Verification Engine
 * Maintains the verified operational timeline and enforces origin integrity.
 * 
 * Zero Fabrication:
 * - Distinguishes between FARMER_CONFIRMED, SYSTEM_OBSERVED, and SIMULATED.
 * - Simulated actions NEVER overwrite permanent historical truth.
 */

export const INITIAL_EXECUTION_EVENTS: ExecutionEvent[] = [
  {
    eventId: 'EVT-EXEC-01',
    executionPlanId: 'PLAN-DEC-01-V1',
    timestamp: '08:15 IST',
    type: 'PLAN_APPROVED',
    status: 'SUCCESS',
    source: 'Farmer In-The-Loop Approval',
    origin: 'FARMER_CONFIRMED',
    title: 'Operational Harvest Plan Approved',
    previousState: 'PENDING_APPROVAL',
    currentState: 'APPROVED_READY',
    evidence: 'Manual biometric/key approval recorded on Field Instrument.',
    notes: 'Farmer validated 32 quintals harvest mobilization for Field 07.',
  },
  {
    eventId: 'EVT-EXEC-02',
    executionPlanId: 'PLAN-DEC-01-V1',
    timestamp: '08:30 IST',
    type: 'PLAN_APPROVED',
    status: 'SUCCESS',
    source: 'Open-Meteo Doppler Feed UP-KN-892',
    origin: 'SYSTEM_OBSERVED',
    title: 'Pre-Harvest Weather Window Re-verified',
    previousState: 'CAUTION',
    currentState: 'VERIFIED_WINDOW',
    evidence: 'Doppler radar confirms storm entry delayed to March 28 evening (36h clear window).',
    notes: 'Safe field cutting window verified prior to crew mobilization.',
  },
  {
    eventId: 'EVT-EXEC-03',
    executionPlanId: 'PLAN-DEC-01-V1',
    timestamp: '09:15 IST',
    type: 'PLAN_APPROVED',
    status: 'SUCCESS',
    source: 'Harvest Lead Manual Check-in',
    origin: 'FARMER_CONFIRMED',
    title: 'Harvest Crew & Equipment Staged at Fieldgate',
    previousState: 'NOT_STARTED',
    currentState: 'CONFIRMED',
    evidence: '2 manual teams and tractor thresher staged on Field 07.',
    notes: 'Crew ready for 09:30 cutting initiation.',
  },
];

export function advanceExecutionStep(
  plan: ExecutionPlan,
  stepId: string,
  newStatus: 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED',
  origin: VerificationOrigin,
  evidenceText: string,
  notes?: string
): { updatedPlan: ExecutionPlan; event: ExecutionEvent } {
  const stepIndex = plan.steps.findIndex(s => s.id === stepId);
  if (stepIndex === -1) {
    throw new Error(`Execution step ${stepId} not found in plan ${plan.planId}`);
  }

  const step = plan.steps[stepIndex];
  const previousState = step.status;
  const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' IST';

  const updatedStep = {
    ...step,
    status: newStatus,
    verificationOrigin: origin,
    verifiedAt: nowTime,
    verificationEvidence: evidenceText,
  };

  const updatedSteps = [...plan.steps];
  updatedSteps[stepIndex] = updatedStep;

  let eventType: ExecutionEvent['type'] = 'PLAN_APPROVED';
  if (step.category === 'HARVEST') {
    eventType = newStatus === 'IN_PROGRESS' ? 'HARVEST_STARTED' : 'HARVEST_COMPLETED';
  } else if (step.id === 'STEP-03') {
    eventType = 'TRANSPORT_CONFIRMED';
  } else if (step.id === 'STEP-07') {
    eventType = 'LOADING_STARTED';
  } else if (step.id === 'STEP-08') {
    eventType = 'DISPATCHED';
  } else if (step.id === 'STEP-09') {
    eventType = 'ARRIVED_AT_MANDI';
  } else if (step.id === 'STEP-10') {
    eventType = 'SALE_RECORDED';
  }

  const event: ExecutionEvent = {
    eventId: `EVT-EXEC-${Date.now()}`,
    executionPlanId: plan.planId,
    timestamp: nowTime,
    type: eventType,
    status: 'SUCCESS',
    source: origin === 'SIMULATED' ? 'Hackathon Execution Sandbox' : 'Farmer Verification Desk',
    origin,
    title: `${step.title}: Marked ${newStatus.replace('_', ' ')}`,
    previousState,
    currentState: newStatus,
    evidence: evidenceText,
    notes,
  };

  return {
    updatedPlan: {
      ...plan,
      steps: updatedSteps,
    },
    event,
  };
}
