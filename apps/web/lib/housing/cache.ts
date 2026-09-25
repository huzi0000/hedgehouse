import rawCache from '../../data/housing-cache.json';

export interface CachedObservation {
  countryCode: string;
  region: string;
  regionId: string;
  provider: string;
  series: string;
  period: string;
  frequency: string;
  value: number;
  unit: string;
  sourceUrl: string;
  retrievedAt: string;
  metadata?: Record<string, unknown>;
}

export interface CachedVerification {
  provider: string;
  region: string;
  officialSource: string;
  httpResult: string;
  latestPeriod: string;
  latestValue: number;
  previousPeriod: string;
  previousValue: number;
  calculatedChange: number;
  observationCount: number;
  status: string;
  notes?: string;
}

export interface RegionData {
  verification: CachedVerification;
  series: {
    countryCode: string;
    region: string;
    provider: string;
    series: string;
    frequency: string;
    observations: CachedObservation[];
  };
}

const typedCache = rawCache as unknown as Record<string, RegionData>;

export function getRegionData(key: string): RegionData | null {
  const k = key.toLowerCase();
  return typedCache[k] || null;
}

export function getRegionVerification(key: string): CachedVerification | null {
  const data = getRegionData(key);
  return data?.verification || null;
}

export function getRegionSeries(key: string): CachedObservation[] {
  const data = getRegionData(key);
  return data?.series?.observations || [];
}

/**
 * Returns recent continuous real observations for chart display
 * (e.g. the last 12-16 quarters or months)
 */
export function getChartObservations(key: string, count = 16): { period: string; value: number; formatted: string }[] {
  const all = getRegionSeries(key);
  if (!all || all.length === 0) return [];

  const slice = all.slice(-count);
  return slice.map((obs) => ({
    period: obs.period,
    value: obs.value,
    formatted: obs.unit === 'AUD' 
      ? `A$${obs.value.toLocaleString()}`
      : obs.value.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 2 }),
  }));
}
