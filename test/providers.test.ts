import { 
  FHFAProvider, 
  UKHPIProvider, 
  URAProvider, 
  ABSProvider 
} from '../src/providers/index.ts';
import type { HousingObservation, HousingSeries } from '../src/types/housing.ts';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

function validateObservation(obs: HousingObservation, expectedCountry: string, expectedFreq: string): void {
  assert(obs.countryCode === expectedCountry, `Invalid countryCode: expected ${expectedCountry}, got ${obs.countryCode}`);
  assert(typeof obs.region === 'string' && obs.region.length > 0, 'region must be a non-empty string');
  assert(typeof obs.regionId === 'string' && obs.regionId.length > 0, 'regionId must be a non-empty string');
  assert(typeof obs.provider === 'string' && obs.provider.length > 0, 'provider must be a non-empty string');
  assert(typeof obs.series === 'string' && obs.series.length > 0, 'series must be a non-empty string');
  assert(typeof obs.period === 'string' && obs.period.length > 0, 'period must be a non-empty string');
  assert(obs.frequency === expectedFreq, `frequency expected ${expectedFreq}, got ${obs.frequency}`);
  assert(typeof obs.value === 'number' && Number.isFinite(obs.value), `value must be a finite number, got ${obs.value}`);
  assert(typeof obs.unit === 'string' && obs.unit.length > 0, 'unit must be a non-empty string');
  assert(typeof obs.sourceUrl === 'string' && obs.sourceUrl.startsWith('http'), 'sourceUrl must be valid URL');
  assert(typeof obs.retrievedAt === 'string' && !isNaN(Date.parse(obs.retrievedAt)), 'retrievedAt must be valid ISO date');
}

export async function runProviderValidationTests(): Promise<void> {
  console.log('[TEST SUITE] Provider Schema Normalization & Live Data Tests');

  // Provider 1: UKHPI (Fastest JSON response)
  console.log('Testing UKHPIProvider (London)...');
  const ukhpi = new UKHPIProvider();
  const london = await ukhpi.fetchObservations('London', 12);
  assert(london.countryCode === 'GB', 'London countryCode should be GB');
  assert(london.observations.length >= 10, 'Expected at least 10 London observations');
  for (const obs of london.observations) {
    validateObservation(obs, 'GB', 'monthly');
  }
  console.log(`  ✓ UKHPIProvider validated ${london.observations.length} observations (latest: ${london.observations[london.observations.length - 1].period})`);

  // Provider 2: URA (Singapore)
  console.log('Testing URAProvider (Singapore)...');
  const ura = new URAProvider();
  const sg = await ura.fetchObservations('Singapore');
  assert(sg.countryCode === 'SG', 'Singapore countryCode should be SG');
  assert(sg.observations.length >= 50, 'Expected at least 50 Singapore historical observations');
  for (const obs of sg.observations.slice(-10)) {
    validateObservation(obs, 'SG', 'quarterly');
  }
  console.log(`  ✓ URAProvider validated ${sg.observations.length} observations (latest: ${sg.observations[sg.observations.length - 1].period})`);

  // Provider 3: ABS (Sydney)
  console.log('Testing ABSProvider (Sydney)...');
  const abs = new ABSProvider();
  const sydney = await abs.fetchObservations('Sydney', 10);
  assert(sydney.countryCode === 'AU', 'Sydney countryCode should be AU');
  assert(sydney.observations.length >= 4, 'Expected at least 4 Sydney quarterly observations');
  for (const obs of sydney.observations) {
    validateObservation(obs, 'AU', 'quarterly');
  }
  console.log(`  ✓ ABSProvider validated ${sydney.observations.length} observations (latest: ${sydney.observations[sydney.observations.length - 1].period})`);

  // Provider 4: FHFA (Miami)
  console.log('Testing FHFAProvider (Miami)...');
  const fhfa = new FHFAProvider();
  const miami = await fhfa.fetchObservations('Miami');
  assert(miami.countryCode === 'US', 'Miami countryCode should be US');
  assert(miami.observations.length >= 100, 'Expected >100 Miami historical observations');
  for (const obs of miami.observations.slice(-10)) {
    validateObservation(obs, 'US', 'quarterly');
  }
  console.log(`  ✓ FHFAProvider validated ${miami.observations.length} observations (latest: ${miami.observations[miami.observations.length - 1].period})`);

  console.log('All Provider Validation Tests Passed!\n');
}
