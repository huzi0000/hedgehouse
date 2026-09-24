import type { ResolutionEvaluation } from '../resolution/types.ts';

export interface MarketResolutionPayload {
  outcome: number; // 1 for YES, 2 for NO (matches Solana program enum)
  outcomeLabel: 'YES' | 'NO';
  evaluation: ResolutionEvaluation;
  reason: string;
}

export class UnresolvedMarketError extends Error {
  readonly evaluation: ResolutionEvaluation;

  constructor(evaluation: ResolutionEvaluation) {
    super(
      `Cannot build resolution instruction for an UNRESOLVED market outcome: ${evaluation.reason}`
    );
    this.evaluation = evaluation;
    this.name = 'UnresolvedMarketError';
  }
}

/**
 * Converts a Phase 0 DeterministicMarketResolver evaluation result into a safe
 * on-chain resolution instruction payload.
 *
 * CRITICAL SAFETY INVARIANT:
 * An UNRESOLVED evaluation will NEVER generate a transaction payload.
 * Attempting to resolve an UNRESOLVED market throws an UnresolvedMarketError.
 */
export function buildResolutionPayload(
  evaluation: ResolutionEvaluation
): MarketResolutionPayload {
  if (evaluation.outcome === 'UNRESOLVED') {
    throw new UnresolvedMarketError(evaluation);
  }

  if (evaluation.outcome === 'YES') {
    return {
      outcome: 1, // MarketOutcome::Yes
      outcomeLabel: 'YES',
      evaluation,
      reason: evaluation.reason,
    };
  }

  if (evaluation.outcome === 'NO') {
    return {
      outcome: 2, // MarketOutcome::No
      outcomeLabel: 'NO',
      evaluation,
      reason: evaluation.reason,
    };
  }

  throw new Error(`Unexpected resolution outcome value: ${evaluation.outcome}`);
}
