import type { HousingSeries, MarketVerificationResult } from '../types/housing.ts';

export interface IHousingDataProvider {
  readonly id: string;
  readonly name: string;
  readonly countryCode: string;
  readonly supportedRegions: string[];
  
  fetchObservations(region: string): Promise<HousingSeries>;
  getVerification(region: string): Promise<MarketVerificationResult>;
}
