import { DeterministicMarketResolver } from '../src/resolution/resolver.ts';
import type { HousingObservation } from '../src/types/housing.ts';
import type { ResolutionRule } from '../src/resolution/types.ts';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

export function runResolutionUnitTests(): void {
  console.log('[TEST SUITE] Resolution Engine Unit Tests');
  const resolver = new DeterministicMarketResolver();

  const mockObservations: HousingObservation[] = [
    {
      countryCode: 'US',
      region: 'Miami',
      regionId: '33124',
      provider: 'FHFA',
      series: 'All-Transactions House Price Index',
      period: '2024-Q2',
      frequency: 'quarterly',
      value: 100.0,
      unit: 'index_points',
      sourceUrl: 'https://fhfa.gov',
      retrievedAt: new Date().toISOString(),
    },
    {
      countryCode: 'US',
      region: 'Miami',
      regionId: '33124',
      provider: 'FHFA',
      series: 'All-Transactions House Price Index',
      period: '2025-Q2',
      frequency: 'quarterly',
      value: 110.0,
      unit: 'index_points',
      sourceUrl: 'https://fhfa.gov',
      retrievedAt: new Date().toISOString(),
    },
    {
      countryCode: 'US',
      region: 'Miami',
      regionId: '33124',
      provider: 'FHFA',
      series: 'All-Transactions House Price Index',
      period: '2026-Q2',
      frequency: 'quarterly',
      value: 105.0,
      unit: 'index_points',
      sourceUrl: 'https://fhfa.gov',
      retrievedAt: new Date().toISOString(),
    },
  ];

  // Test 1: TARGET_LT_BASELINE (105 < 110 -> YES)
  const r1: ResolutionRule = {
    baselinePeriod: '2025-Q2',
    targetPeriod: '2026-Q2',
    condition: 'TARGET_LT_BASELINE',
  };
  const e1 = resolver.resolve(mockObservations, r1);
  assert(e1.outcome === 'YES', `Expected YES for 105 < 110, got ${e1.outcome}`);
  console.log('  ✓ TARGET_LT_BASELINE resolves to YES when target < baseline');

  // Test 2: TARGET_GT_BASELINE (105 > 110 -> NO)
  const r2: ResolutionRule = {
    baselinePeriod: '2025-Q2',
    targetPeriod: '2026-Q2',
    condition: 'TARGET_GT_BASELINE',
  };
  const e2 = resolver.resolve(mockObservations, r2);
  assert(e2.outcome === 'NO', `Expected NO for 105 > 110, got ${e2.outcome}`);
  console.log('  ✓ TARGET_GT_BASELINE resolves to NO when target <= baseline');

  // Test 3: TARGET_GT_BASELINE (110 > 100 -> YES)
  const r3: ResolutionRule = {
    baselinePeriod: '2024-Q2',
    targetPeriod: '2025-Q2',
    condition: 'TARGET_GT_BASELINE',
  };
  const e3 = resolver.resolve(mockObservations, r3);
  assert(e3.outcome === 'YES', `Expected YES for 110 > 100, got ${e3.outcome}`);
  console.log('  ✓ TARGET_GT_BASELINE resolves to YES when target > baseline');

  // Test 4: YOY_CHANGE_GT (from 100 to 110 is +10%. Threshold: 5% -> YES)
  const r4: ResolutionRule = {
    baselinePeriod: '2024-Q2',
    targetPeriod: '2025-Q2',
    condition: 'YOY_CHANGE_GT',
    threshold: 5.0,
  };
  const e4 = resolver.resolve(mockObservations, r4);
  assert(e4.outcome === 'YES', `Expected YES for +10% > 5%, got ${e4.outcome}`);
  assert(e4.percentageChange === 10, `Expected +10%, got ${e4.percentageChange}`);
  console.log('  ✓ YOY_CHANGE_GT resolves to YES when YoY change exceeds threshold');

  // Test 5: YOY_CHANGE_LT (from 110 to 105 is -4.5455%. Threshold: 0.0 -> YES)
  const r5: ResolutionRule = {
    baselinePeriod: '2025-Q2',
    targetPeriod: '2026-Q2',
    condition: 'YOY_CHANGE_LT',
    threshold: 0.0,
  };
  const e5 = resolver.resolve(mockObservations, r5);
  assert(e5.outcome === 'YES', `Expected YES for -4.55% < 0%, got ${e5.outcome}`);
  console.log('  ✓ YOY_CHANGE_LT resolves to YES when YoY change is below threshold');

  // Test 6: Missing target observation returns UNRESOLVED
  const r6: ResolutionRule = {
    baselinePeriod: '2025-Q2',
    targetPeriod: '2027-Q2',
    condition: 'TARGET_GT_BASELINE',
  };
  const e6 = resolver.resolve(mockObservations, r6);
  assert(e6.outcome === 'UNRESOLVED', `Expected UNRESOLVED for missing target, got ${e6.outcome}`);
  console.log('  ✓ Missing future observation returns UNRESOLVED');

  // Test 7: Missing baseline observation returns UNRESOLVED
  const r7: ResolutionRule = {
    baselinePeriod: '1990-Q1',
    targetPeriod: '2025-Q2',
    condition: 'TARGET_GT_BASELINE',
  };
  const e7 = resolver.resolve(mockObservations, r7);
  assert(e7.outcome === 'UNRESOLVED', `Expected UNRESOLVED for missing baseline, got ${e7.outcome}`);
  console.log('  ✓ Missing past baseline returns UNRESOLVED');

  // Test 8: Period format variations ("Q2 2025" vs "2025-Q2")
  const r8: ResolutionRule = {
    baselinePeriod: 'Q2 2024',
    targetPeriod: '2025-Q2',
    condition: 'TARGET_GT_BASELINE',
  };
  const e8 = resolver.resolve(mockObservations, r8);
  assert(e8.outcome === 'YES', `Expected YES for Q2 2024 format, got ${e8.outcome}`);
  console.log('  ✓ Handles flexible period representations seamlessly');

  console.log('All Resolution Engine Unit Tests Passed!\n');
}
