import type { HousingObservation } from '../types/housing.ts';
import type { 
  ResolutionRule, 
  ResolutionEvaluation, 
  ResolutionOutcome 
} from './types.ts';
import { arePeriodsEqual, normalizePeriod } from '../utils/period.ts';

export class DeterministicMarketResolver {
  /**
   * Evaluates a deterministic prediction market rule against a set of normalized observations.
   *
   * @param observations Array of normalized observations (e.g. from a HousingSeries)
   * @param rule The resolution rule specifying baseline, target, condition, and optional threshold
   * @returns Detailed resolution evaluation with outcome YES, NO, or UNRESOLVED
   */
  resolve(observations: HousingObservation[], rule: ResolutionRule): ResolutionEvaluation {
    const normBaseline = normalizePeriod(rule.baselinePeriod);
    const normTarget = normalizePeriod(rule.targetPeriod);

    // Locate matching observations
    const baselineObs = observations.find(o => arePeriodsEqual(o.period, normBaseline));
    const targetObs = observations.find(o => arePeriodsEqual(o.period, normTarget));

    if (!baselineObs) {
      return {
        outcome: 'UNRESOLVED',
        rule,
        reason: `Baseline observation for period "${rule.baselinePeriod}" (${normBaseline}) was not found in available dataset.`,
      };
    }

    if (!targetObs) {
      return {
        outcome: 'UNRESOLVED',
        rule,
        baselineObservation: baselineObs,
        baselineValue: baselineObs.value,
        reason: `Target observation for period "${rule.targetPeriod}" (${normTarget}) has not been published yet or is missing.`,
      };
    }

    const baselineVal = baselineObs.value;
    const targetVal = targetObs.value;

    if (baselineVal === 0) {
      return {
        outcome: 'UNRESOLVED',
        rule,
        baselineObservation: baselineObs,
        targetObservation: targetObs,
        baselineValue: baselineVal,
        targetValue: targetVal,
        reason: `Baseline observation value is zero; cannot compute relative change.`,
      };
    }

    const percentageChange = ((targetVal - baselineVal) / Math.abs(baselineVal)) * 100;
    const threshold = rule.threshold ?? 0.0;

    let outcome: ResolutionOutcome;
    let reason: string;

    switch (rule.condition) {
      case 'TARGET_LT_BASELINE': {
        const isLt = targetVal < baselineVal;
        outcome = isLt ? 'YES' : 'NO';
        reason = `Condition TARGET_LT_BASELINE: target (${targetVal}) ${isLt ? '<' : '>='} baseline (${baselineVal}). Change: ${percentageChange.toFixed(2)}%.`;
        break;
      }

      case 'TARGET_GT_BASELINE': {
        const isGt = targetVal > baselineVal;
        outcome = isGt ? 'YES' : 'NO';
        reason = `Condition TARGET_GT_BASELINE: target (${targetVal}) ${isGt ? '>' : '<='} baseline (${baselineVal}). Change: ${percentageChange.toFixed(2)}%.`;
        break;
      }

      case 'YOY_CHANGE_GT': {
        const isGt = percentageChange > threshold;
        outcome = isGt ? 'YES' : 'NO';
        reason = `Condition YOY_CHANGE_GT: change (${percentageChange.toFixed(2)}%) ${isGt ? '>' : '<='} threshold (${threshold}%). Baseline: ${baselineVal}, Target: ${targetVal}.`;
        break;
      }

      case 'YOY_CHANGE_LT': {
        const isLt = percentageChange < threshold;
        outcome = isLt ? 'YES' : 'NO';
        reason = `Condition YOY_CHANGE_LT: change (${percentageChange.toFixed(2)}%) ${isLt ? '<' : '>='} threshold (${threshold}%). Baseline: ${baselineVal}, Target: ${targetVal}.`;
        break;
      }

      default:
        outcome = 'UNRESOLVED';
        reason = `Unknown or unsupported resolution condition: ${rule.condition}`;
    }

    return {
      outcome,
      rule,
      baselineObservation: baselineObs,
      targetObservation: targetObs,
      baselineValue: baselineVal,
      targetValue: targetVal,
      percentageChange: parseFloat(percentageChange.toFixed(4)),
      reason,
    };
  }
}
