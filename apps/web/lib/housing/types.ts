export type CountryCode = 'US' | 'GB' | 'SG' | 'AU';
export type Frequency = 'monthly' | 'quarterly' | 'annual';
export type MarketStatus = 'ACTIVE' | 'RESOLVING_SOON' | 'SETTLED' | 'UPCOMING';
export type ResolutionCondition = 'TARGET_LT_BASELINE' | 'TARGET_GT_BASELINE' | 'YOY_CHANGE_GT' | 'YOY_CHANGE_LT';

export interface DataPoint {
  period: string; // e.g. "2024-Q1" or "2026-07"
  value: number;
  formatted: string;
}

export interface MarketItem {
  id: string; // e.g. "mia-fhfa-2027q2-lt-2026q2"
  ticker: string; // e.g. "MIA-27Q2-DECLINE"
  title: string; // e.g. "Will Miami House Prices Decline YoY by Q2 2027?"
  city: string;
  country: string;
  countryCode: CountryCode;
  coordinates: string; // e.g. "25.7617° N, 80.1918° W"
  provider: string; // e.g. "FHFA"
  providerFullName: string; // "Federal Housing Finance Agency"
  seriesName: string;
  frequency: Frequency;
  baselinePeriod: string; // e.g. "2026-Q2"
  baselineValue: number;
  targetPeriod: string; // e.g. "2027-Q2"
  targetThreshold?: number;
  condition: ResolutionCondition;
  ruleFormula: string; // e.g. "FHFA(2027-Q2) < FHFA(2026-Q2)"
  unit: string;
  status: MarketStatus;
  resolutionDate: string; // Expected release date e.g. "Aug 2027"
  officialSourceUrl: string;
  verificationStatus: 'PASS' | 'PENDING';
  historicalSeries: DataPoint[];
  description: string;
  economicContext: string;
}

export interface ProviderProfile {
  id: string;
  name: string;
  country: string;
  countryCode: CountryCode;
  jurisdiction: string;
  frequency: Frequency;
  publicationLag: string;
  latestPeriod: string;
  latestValue: string;
  status: 'ONLINE' | 'STANDBY';
  datasetName: string;
  endpoint: string;
  accessMethod: string;
  license: string;
  description: string;
  historicalDepth: string;
}
