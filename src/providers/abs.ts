import type { IHousingDataProvider } from './base.ts';
import type { 
  HousingObservation, 
  HousingSeries, 
  MarketVerificationResult 
} from '../types/housing.ts';

export class ABSProvider implements IHousingDataProvider {
  readonly id = 'ABS';
  readonly name = 'Australian Bureau of Statistics';
  readonly countryCode = 'AU';
  readonly supportedRegions = ['Sydney'];

  // ABS Catalogue 6432.0: Total Value of Dwellings (Actively maintained quarterly series)
  // Replaces the discontinued Cat 6416.0 Residential Property Price Indexes
  static readonly DATAFLOW_ID = 'ABS,RES_DWELL,1.0.0';
  static readonly BASE_API_URL = 'https://data.api.abs.gov.au/rest/data';

  // Region identifier for Greater Sydney in ABS ASGS/GCCSA classification
  static readonly SYDNEY_REGION_CODE = '1GSYD';

  // Measure 3: Median Price of Established House Transfers (Unit: Thousands of AUD)
  static readonly MEASURE_MEDIAN_HOUSE_PRICE = '3';

  async fetchObservations(regionName: string, lastN = 40): Promise<HousingSeries> {
    if (regionName.toLowerCase() !== 'sydney') {
      throw new Error(`Unsupported region "${regionName}" for ABS provider. Supported: ${this.supportedRegions.join(', ')}`);
    }

    // SDMX REST API Query:
    // Request all dimensions at observation level to easily decode dimensions
    const endpoint = `${ABSProvider.BASE_API_URL}/${ABSProvider.DATAFLOW_ID}/all?dimensionAtObservation=AllDimensions&lastNObservations=${lastN}`;
    
    const res = await fetch(endpoint, {
      headers: {
        'Accept': 'application/vnd.sdmx.data+json;version=1.0.0-wd',
        'User-Agent': 'HedgeHouseDataFeasibility/1.0',
      },
    });

    if (!res.ok) {
      throw new Error(`ABS SDMX fetch failed: HTTP ${res.status} ${res.statusText}`);
    }

    const json = await res.json();
    const dataSet = json?.data?.dataSets?.[0];
    if (!dataSet || !dataSet.observations) {
      throw new Error('ABS SDMX response contained no dataSet or observations');
    }

    const obsDimensions = json.data?.structure?.dimensions?.observation;
    if (!Array.isArray(obsDimensions)) {
      throw new Error('ABS SDMX response lacked observation dimensions structure');
    }

    // Find dimension indexes
    const measureDimIndex = obsDimensions.findIndex((d: any) => d.id === 'MEASURE');
    const regionDimIndex = obsDimensions.findIndex((d: any) => d.id === 'REGION');
    const timeDimIndex = obsDimensions.findIndex((d: any) => d.id === 'TIME_PERIOD');

    if (measureDimIndex === -1 || regionDimIndex === -1 || timeDimIndex === -1) {
      throw new Error('ABS observation dimensions missing MEASURE, REGION, or TIME_PERIOD');
    }

    const measureValues = obsDimensions[measureDimIndex].values;
    const regionValues = obsDimensions[regionDimIndex].values;
    const timeValues = obsDimensions[timeDimIndex].values;

    // Find the value index for 1GSYD (Greater Sydney)
    const sydneyValueIdx = regionValues.findIndex((r: any) => r.id === ABSProvider.SYDNEY_REGION_CODE);
    if (sydneyValueIdx === -1) {
      throw new Error(`Greater Sydney code (${ABSProvider.SYDNEY_REGION_CODE}) not found in ABS dimensions`);
    }

    // Find the value index for Measure 3 (Median Price of Established House Transfers)
    const measureValueIdx = measureValues.findIndex((m: any) => m.id === ABSProvider.MEASURE_MEDIAN_HOUSE_PRICE);
    if (measureValueIdx === -1) {
      throw new Error(`Median price measure code (${ABSProvider.MEASURE_MEDIAN_HOUSE_PRICE}) not found in ABS dimensions`);
    }

    const retrievedAt = new Date().toISOString();
    const observations: HousingObservation[] = [];

    // Observation keys are format "measureIdx:regionIdx:freqIdx:timeIdx"
    for (const [key, obsVal] of Object.entries<any>(dataSet.observations)) {
      const parts = key.split(':');
      const mIdx = parseInt(parts[measureDimIndex], 10);
      const rIdx = parseInt(parts[regionDimIndex], 10);
      const tIdx = parseInt(parts[timeDimIndex], 10);

      if (mIdx === measureValueIdx && rIdx === sydneyValueIdx) {
        const periodObj = timeValues[tIdx];
        const period = periodObj?.id; // e.g. "2026-Q2"
        const rawValue = obsVal[0]; // e.g. 1487.6 (in AUD thousands)

        if (period && typeof rawValue === 'number') {
          // Normalize value to full AUD ($1,487,600)
          const fullAudValue = Math.round(rawValue * 1000);

          observations.push({
            countryCode: 'AU',
            region: 'Sydney',
            regionId: ABSProvider.SYDNEY_REGION_CODE,
            provider: this.id,
            series: 'Median Price of Established House Transfers (Greater Sydney)',
            period,
            frequency: 'quarterly',
            value: fullAudValue,
            unit: 'AUD',
            sourceUrl: 'https://www.abs.gov.au/statistics/economy/price-indexes-and-inflation/total-value-dwellings',
            retrievedAt,
            metadata: {
              rawUnits: 'AUD Thousands',
              rawNumber: rawValue,
              absCatalogue: '6432.0 (Total Value of Dwellings)',
              dwellingType: 'Established Houses',
              regionName: 'Greater Sydney',
            },
          });
        }
      }
    }

    // Sort chronologically ascending
    observations.sort((a, b) => a.period.localeCompare(b.period));

    return {
      countryCode: 'AU',
      region: 'Sydney',
      provider: this.id,
      series: 'Median Price of Established House Transfers (Greater Sydney)',
      frequency: 'quarterly',
      observations,
    };
  }

  async getVerification(regionName: string): Promise<MarketVerificationResult> {
    const series = await this.fetchObservations(regionName, 20);
    const count = series.observations.length;

    if (count === 0) {
      return {
        provider: this.id,
        region: regionName,
        officialSource: 'Australian Bureau of Statistics (ABS 6432.0 Total Value of Dwellings)',
        httpResult: 'HTTP 200 OK (0 items matched)',
        latestPeriod: 'N/A',
        latestValue: 0,
        previousPeriod: 'N/A',
        previousValue: 0,
        calculatedChange: 0,
        observationCount: 0,
        status: 'FAIL',
        notes: 'Failed to extract Sydney observations from ABS SDMX dataflow.',
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
      officialSource: 'Australian Bureau of Statistics (ABS)',
      httpResult: 'HTTP 200 OK (SDMX-JSON REST API)',
      latestPeriod: latest.period,
      latestValue: latest.value,
      previousPeriod: previous.period,
      previousValue: previous.value,
      calculatedChange: parseFloat(change.toFixed(2)),
      observationCount: count,
      status: count >= 4 ? 'PASS' : 'PARTIAL',
      notes: `Official active Cat 6432.0 Total Value of Dwellings (replaces discontinued 6416.0). Greater Sydney median established house price in AUD.`,
    };
  }
}
