export type CountryCode = 'US' | 'GB' | 'SG' | 'AU';
export type Frequency = 'monthly' | 'quarterly' | 'annual';
export type VerificationStatus = 'PASS' | 'PARTIAL' | 'FAIL';

export interface HousingObservation {
  countryCode: CountryCode;
  region: string;
  regionId: string;
  provider: string;
  series: string;
  period: string;
  frequency: Frequency;
  value: number;
  unit: string;
  sourceUrl: string;
  retrievedAt: string;
  metadata?: Record<string, unknown>;
}

export interface HousingSeries {
  countryCode: CountryCode;
  region: string;
  provider: string;
  series: string;
  frequency: Frequency;
  observations: HousingObservation[];
}

export interface MarketVerificationResult {
  provider: string;
  region: string;
  officialSource: string;
  httpResult: string;
  latestPeriod: string;
  latestValue: number;
  previousPeriod: string;
  previousValue: number;
  calculatedChange: number; // percentage change (e.g., +2.5 for +2.5%)
  observationCount: number;
  status: VerificationStatus;
  notes?: string;
}
