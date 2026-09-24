import type { IHousingDataProvider } from './base.ts';
import type { 
  HousingObservation, 
  HousingSeries, 
  MarketVerificationResult 
} from '../types/housing.ts';

interface UKHPIApiItem {
  refMonth: string;
  housePriceIndex: number;
  averagePrice?: number;
  percentageAnnualChange?: number;
  percentageChange?: number;
  refRegion?: {
    _about?: string;
    label?: Array<{ _value: string }>;
  };
}

export class UKHPIProvider implements IHousingDataProvider {
  readonly id = 'UKHPI';
  readonly name = 'HM Land Registry / Office for National Statistics';
  readonly countryCode = 'GB';
  readonly supportedRegions = ['London'];

  static readonly BASE_URL = 'http://landregistry.data.gov.uk/data/ukhpi/region';

  private readonly regionMappings: Record<string, { slug: string; displayName: string }> = {
    london: {
      slug: 'london',
      displayName: 'London',
    },
  };

  async fetchObservations(regionName: string, maxItems = 100): Promise<HousingSeries> {
    const key = regionName.toLowerCase();
    const mapping = this.regionMappings[key];
    if (!mapping) {
      throw new Error(`Unsupported region "${regionName}" for UKHPI provider. Supported: ${this.supportedRegions.join(', ')}`);
    }

    const endpoint = `${UKHPIProvider.BASE_URL}/${mapping.slug}.json?_pageSize=${maxItems}&_view=all`;
    const res = await fetch(endpoint, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'HedgeHouseDataFeasibility/1.0',
      },
    });

    if (!res.ok) {
      throw new Error(`UK HPI fetch failed: HTTP ${res.status} ${res.statusText}`);
    }

    const json = await res.json();
    const items: UKHPIApiItem[] = json?.result?.items || [];
    const retrievedAt = new Date().toISOString();

    const observations: HousingObservation[] = [];

    for (const item of items) {
      if (!item.refMonth || item.housePriceIndex === undefined || item.housePriceIndex === null) {
        continue;
      }

      observations.push({
        countryCode: 'GB',
        region: 'London',
        regionId: mapping.slug,
        provider: this.id,
        series: 'UK House Price Index (All Dwellings)',
        period: item.refMonth,
        frequency: 'monthly',
        value: Number(item.housePriceIndex),
        unit: 'index_points',
        sourceUrl: endpoint,
        retrievedAt,
        metadata: {
          averagePriceGbp: item.averagePrice,
          percentageAnnualChange: item.percentageAnnualChange,
          percentageChange: item.percentageChange,
          regionAbout: item.refRegion?._about,
        },
      });
    }

    // Sort chronologically ascending
    observations.sort((a, b) => a.period.localeCompare(b.period));

    return {
      countryCode: 'GB',
      region: 'London',
      provider: this.id,
      series: 'UK House Price Index (All Dwellings)',
      frequency: 'monthly',
      observations,
    };
  }

  async getVerification(regionName: string): Promise<MarketVerificationResult> {
    const series = await this.fetchObservations(regionName, 60);
    const count = series.observations.length;

    if (count === 0) {
      return {
        provider: this.id,
        region: regionName,
        officialSource: 'HM Land Registry / Office for National Statistics (UK HPI)',
        httpResult: 'HTTP 200 OK (0 items parsed)',
        latestPeriod: 'N/A',
        latestValue: 0,
        previousPeriod: 'N/A',
        previousValue: 0,
        calculatedChange: 0,
        observationCount: 0,
        status: 'FAIL',
        notes: 'Failed to parse monthly observations for London.',
      };
    }

    const latest = series.observations[count - 1];
    const previous = count > 1 ? series.observations[count - 2] : latest;
    const change = previous.value !== 0 
      ? ((latest.value - previous.value) / previous.value) * 100 
      : 0;

    return {
      provider: this.id,
      region: regionName,
      officialSource: 'HM Land Registry / Office for National Statistics (UK HPI)',
      httpResult: 'HTTP 200 OK (Linked Data JSON API)',
      latestPeriod: latest.period,
      latestValue: latest.value,
      previousPeriod: previous.period,
      previousValue: previous.value,
      calculatedChange: parseFloat(change.toFixed(2)),
      observationCount: count,
      status: count >= 10 ? 'PASS' : 'PARTIAL',
      notes: `Official monthly UK HPI for London (Base: Jan 2015 = 100). Average price: £${latest.metadata?.averagePriceGbp ?? 'N/A'}.`,
    };
  }
}
