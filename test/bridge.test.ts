import { 
  buildResolutionPayload, 
  UnresolvedMarketError 
} from '../src/bridge/resolution_bridge.ts';
import type { ResolutionEvaluation } from '../src/resolution/types.ts';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

export function runBridgeUnitTests(): void {
  console.log('[TEST SUITE] Phase 0 -> Phase 1 Bridge Unit Tests');

  // Test 1: YES outcome conversion
  const yesEval: ResolutionEvaluation = {
    outcome: 'YES',
    rule: {
      baselinePeriod: '2025-Q2',
      targetPeriod: '2026-Q2',
      condition: 'TARGET_GT_BASELINE',
    },
    baselineValue: 657.88,
    targetValue: 666.21,
    percentageChange: 1.2662,
    reason: 'Target greater than baseline',
  };

  const yesPayload = buildResolutionPayload(yesEval);
  assert(yesPayload.outcome === 1, `Expected outcome 1 for YES, got ${yesPayload.outcome}`);
  assert(yesPayload.outcomeLabel === 'YES', 'Expected outcomeLabel YES');
  console.log('  ✓ Bridge correctly maps YES evaluation to on-chain outcome 1');

  // Test 2: NO outcome conversion
  const noEval: ResolutionEvaluation = {
    outcome: 'NO',
    rule: {
      baselinePeriod: '2025-Q2',
      targetPeriod: '2026-Q2',
      condition: 'TARGET_LT_BASELINE',
    },
    baselineValue: 657.88,
    targetValue: 666.21,
    percentageChange: 1.2662,
    reason: 'Target not less than baseline',
  };

  const noPayload = buildResolutionPayload(noEval);
  assert(noPayload.outcome === 2, `Expected outcome 2 for NO, got ${noPayload.outcome}`);
  assert(noPayload.outcomeLabel === 'NO', 'Expected outcomeLabel NO');
  console.log('  ✓ Bridge correctly maps NO evaluation to on-chain outcome 2');

  // Test 3: UNRESOLVED must throw and refuse payload creation
  const unresolvedEval: ResolutionEvaluation = {
    outcome: 'UNRESOLVED',
    rule: {
      baselinePeriod: '2026-Q2',
      targetPeriod: '2027-Q2',
      condition: 'TARGET_GT_BASELINE',
    },
    reason: 'Target observation for period 2027-Q2 has not been published yet',
  };

  let threwExpected = false;
  try {
    buildResolutionPayload(unresolvedEval);
  } catch (err: any) {
    if (err instanceof UnresolvedMarketError) {
      threwExpected = true;
    }
  }

  assert(threwExpected, 'Expected UnresolvedMarketError when resolving UNRESOLVED evaluation');
  console.log('  ✓ Bridge strictly throws UnresolvedMarketError for UNRESOLVED markets (refuses TX creation)');

  console.log('All Bridge Unit Tests Passed!\n');
}
