import fs from 'node:fs';
import path from 'node:path';
import { 
  FHFAProvider, 
  UKHPIProvider, 
  URAProvider, 
  ABSProvider 
} from '../src/providers/index.ts';
import type { HousingSeries, MarketVerificationResult } from '../src/types/housing.ts';

async function main() {
  console.log('Fetching 100% REAL data from Phase 0 providers for web cache...');

  const providers = [
    { provider: new FHFAProvider(), region: 'Miami', key: 'miami' },
    { provider: new UKHPIProvider(), region: 'London', key: 'london' },
    { provider: new URAProvider(), region: 'Singapore', key: 'singapore' },
    { provider: new ABSProvider(), region: 'Sydney', key: 'sydney' },
  ];

  const cache: Record<string, {
    verification: MarketVerificationResult;
    series: HousingSeries;
  }> = {};

  for (const { provider, region, key } of providers) {
    console.log(`Ingesting ${provider.id} for ${region}...`);
    const verification = await provider.getVerification(region);
    const series = await provider.fetchObservations(region);
    cache[key] = {
      verification,
      series,
    };
    console.log(`  ✓ ${region}: ${series.observations.length} real observations, latest: ${verification.latestPeriod} = ${verification.latestValue}`);
  }

  const outDir = path.resolve('apps/web/data');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const outFile = path.join(outDir, 'housing-cache.json');
  fs.writeFileSync(outFile, JSON.stringify(cache, null, 2), 'utf-8');
  console.log(`\nSuccessfully exported real housing data to: ${outFile}`);
}

main().catch(err => {
  console.error('Data export failed:', err);
  process.exit(1);
});
