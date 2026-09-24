import { runResolutionUnitTests } from './resolution.test.ts';
import { runBridgeUnitTests } from './bridge.test.ts';
import { runAnchorProtocolTests } from '../tests/anchor/hedgehouse.ts';
import { runProviderValidationTests } from './providers.test.ts';

async function main() {
  console.log('==================================================');
  console.log('HedgeHouse Master Test Suite Runner (Phase 0 + Phase 1)');
  console.log('==================================================\n');

  // 1. Phase 0 Resolution Engine Unit Tests
  runResolutionUnitTests();

  // 2. Phase 1 Bridge Unit Tests
  runBridgeUnitTests();

  // 3. Phase 1 Anchor Protocol Invariant Tests (All 15 Scenarios)
  runAnchorProtocolTests();

  // 4. Phase 0 Live Provider Data Ingestion & Normalization Tests
  await runProviderValidationTests();

  console.log('==================================================');
  console.log('🎉 ALL HEDGEHOUSE SUITES PASSED (PHASE 0 + PHASE 1)');
  console.log('==================================================');
}

main().catch(err => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
