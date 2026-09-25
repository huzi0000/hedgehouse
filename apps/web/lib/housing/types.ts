export type CountryCode = 'US' | 'GB' | 'SG' | 'AU';
export type Frequency = 'monthly' | 'quarterly' | 'annual';
export type MarketStatus = 'COMING ON-CHAIN' | 'AWAITING DEPLOYMENT' | 'SETTLED' | 'ACTIVE';
export type ResolutionCondition = 'TARGET_LT_BASELINE' | 'TARGET_GT_BASELINE' | 'YOY_CHANGE_GT' | 'YOY_CHANGE_LT';

export interface DataPoint {
  period: string; // e.g. "2024-Q1" or "2026-07"
  value: number;
  formatted: string;
}

export interface MarketItem {
  id: string;
  ticker: string;
  title: string;
  city: string;
  country: string;
  countryCode: CountryCode;
  coordinates: string;
  provider: string;
  providerFullName: string;
  seriesName: string;
  frequency: Frequency;
  baselinePeriod: string;
  baselineValue: number;
  targetPeriod: string;
  targetThreshold?: number;
  condition: ResolutionCondition;
  ruleFormula: string;
  unit: string;
  status: MarketStatus;
  resolutionDate: string;
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
