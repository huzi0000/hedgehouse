import { 
  FHFAProvider, 
  UKHPIProvider, 
  URAProvider, 
  ABSProvider 
} from '../src/providers/index.ts';
import type { MarketVerificationResult } from '../src/types/housing.ts';

function printResult(res: MarketVerificationResult): void {
  console.log('==================================================');
  console.log(`Provider:                  ${res.provider}`);
  console.log(`Region:                    ${res.region}`);
  console.log(`Official source:           ${res.officialSource}`);
  console.log(`HTTP/file result:          ${res.httpResult}`);
  console.log(`Latest available period:   ${res.latestPeriod}`);
  console.log(`Latest value:              ${res.latestValue}`);
  console.log(`Previous comparable period:${res.previousPeriod}`);
  console.log(`Previous value:            ${res.previousValue}`);
  console.log(`Calculated change:         ${res.calculatedChange >= 0 ? '+' : ''}${res.calculatedChange}%`);
  console.log(`Observation count:         ${res.observationCount}`);
  console.log(`Status:                    ${res.status}`);
  if (res.notes) {
    console.log(`Notes:                     ${res.notes}`);
  }
}

async function main(): Promise<void> {
  console.log('HedgeHouse Phase 0: Real Market Data Ingestion & Verification\n');

  const providers = [
    { provider: new FHFAProvider(), region: 'Miami' },
    { provider: new UKHPIProvider(), region: 'London' },
    { provider: new URAProvider(), region: 'Singapore' },
    { provider: new ABSProvider(), region: 'Sydney' },
  ];

  const results: MarketVerificationResult[] = [];

  for (const { provider, region } of providers) {
    try {
      console.log(`Querying ${provider.id} for ${region}...`);
      const res = await provider.getVerification(region);
      results.push(res);
      printResult(res);
    } catch (err: any) {
      console.error(`ERROR querying ${provider.id} for ${region}:`, err.message);
      const failRes: MarketVerificationResult = {
        provider: provider.id,
        region,
        officialSource: provider.name,
        httpResult: `FAIL: ${err.message}`,
        latestPeriod: 'N/A',
        latestValue: 0,
        previousPeriod: 'N/A',
        previousValue: 0,
        calculatedChange: 0,
        observationCount: 0,
        status: 'FAIL',
        notes: err.message,
      };
      results.push(failRes);
      printResult(failRes);
    }
  }

  console.log('\n==================================================');
  console.log('SUMMARY MATRIX:');
  console.log('==================================================');
  console.log(
    'Market'.padEnd(12) +
    ' | Provider'.padEnd(12) +
    ' | Latest Period'.padEnd(16) +
    ' | Latest Value'.padEnd(16) +
    ' | Count'.padEnd(8) +
    ' | Status'
  );
  console.log('-'.repeat(75));

  for (const r of results) {
    console.log(
      r.region.padEnd(12) +
      ` | ${r.provider}`.padEnd(12) +
      ` | ${r.latestPeriod}`.padEnd(16) +
      ` | ${String(r.latestValue)}`.padEnd(16) +
      ` | ${String(r.observationCount)}`.padEnd(8) +
      ` | ${r.status}`
    );
  }
}

main().catch(err => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
