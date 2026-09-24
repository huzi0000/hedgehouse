import type { HousingObservation } from '../types/housing.ts';

export type ResolutionCondition = 
  | 'TARGET_LT_BASELINE'
  | 'TARGET_GT_BASELINE'
  | 'YOY_CHANGE_GT'
  | 'YOY_CHANGE_LT';

export type ResolutionOutcome = 'YES' | 'NO' | 'UNRESOLVED';

export interface ResolutionRule {
  baselinePeriod: string; // e.g. "2025-Q2" or "Q2 2025" or "2025-06"
  targetPeriod: string;   // e.g. "2026-Q2" or "Q2 2026" or "2026-06"
  condition: ResolutionCondition;
  threshold?: number;     // percentage threshold for YOY_CHANGE_* (e.g. 5.0 for +5%, default 0.0)
}

export interface ResolutionEvaluation {
  outcome: ResolutionOutcome;
  rule: ResolutionRule;
  baselineObservation?: HousingObservation;
  targetObservation?: HousingObservation;
  baselineValue?: number;
  targetValue?: number;
  percentageChange?: number;
  reason: string;
}
