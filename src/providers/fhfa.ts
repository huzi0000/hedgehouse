import { createInterface } from 'node:readline';
import { Readable } from 'node:stream';
import type { IHousingDataProvider } from './base.ts';
import type { 
  HousingObservation, 
  HousingSeries, 
  MarketVerificationResult 
} from '../types/housing.ts';

export class FHFAProvider implements IHousingDataProvider {
  readonly id = 'FHFA';
  readonly name = 'Federal Housing Finance Agency';
  readonly countryCode = 'US';
  readonly supportedRegions = ['Miami'];

  static readonly DEFAULT_SOURCE_URL = 'https://www.fhfa.gov/hpi/download/monthly/hpi_master.csv';

  // Miami-Miami Beach-Kendall, FL Metropolitan Division (MSAD)
  private readonly regionMappings: Record<string, { placeId: string; name: string }> = {
    miami: {
      placeId: '33124',
      name: 'Miami-Miami Beach-Kendall, FL (MSAD)',
    },
  };

  async fetchObservations(regionName: string): Promise<HousingSeries> {
    const key = regionName.toLowerCase();
    const mapping = this.regionMappings[key];
    if (!mapping) {
      throw new Error(`Unsupported region "${regionName}" for FHFA provider. Supported: ${this.supportedRegions.join(', ')}`);
    }

    const sourceUrl = FHFAProvider.DEFAULT_SOURCE_URL;
    const res = await fetch(sourceUrl, {
      headers: {
        'User-Agent': 'HedgeHouseDataFeasibility/1.0',
      },
    });

    if (!res.ok) {
      throw new Error(`FHFA fetch failed: HTTP ${res.status} ${res.statusText}`);
    }

    const stream = Readable.fromWeb(res.body as any);
    const rl = createInterface({ input: stream, crlfDelay: Infinity });

    let headerIndex: Record<string, number> | null = null;
    const observations: HousingObservation[] = [];
    const retrievedAt = new Date().toISOString();

    for await (const rawLine of rl) {
      const line = rawLine.trim();
      if (!line) continue;

      if (!headerIndex) {
        const parts = line.split(',');
        headerIndex = {};
        for (let i = 0; i < parts.length; i++) {
          headerIndex[parts[i].trim()] = i;
        }
        continue;
      }

      // Fast check before regex or splitting
      if (!line.includes(mapping.placeId)) continue;

      // Handle possible quotes around place_name: traditional,all-transactions,quarterly,MSA,"Miami-Miami Beach-Kendall, FL (MSAD)",33124,1975,4,36.87,,,
      const parsed = this.parseCsvLine(line);
      const placeId = parsed[headerIndex['place_id']];
      const flavor = parsed[headerIndex['hpi_flavor']];
      const freq = parsed[headerIndex['frequency']];
      const hpiType = parsed[headerIndex['hpi_type']];

      if (
        placeId === mapping.placeId &&
        flavor === 'all-transactions' &&
        freq === 'quarterly' &&
        hpiType === 'traditional'
      ) {
        const yr = parsed[headerIndex['yr']];
        const periodNum = parsed[headerIndex['period']];
        const valStr = parsed[headerIndex['index_nsa']];
        const val = parseFloat(valStr);

        if (!isNaN(val)) {
          const period = `${yr}-Q${periodNum}`;
          observations.push({
            countryCode: 'US',
            region: 'Miami',
            regionId: mapping.placeId,
            provider: this.id,
            series: 'All-Transactions House Price Index (NSA)',
            period,
            frequency: 'quarterly',
            value: val,
            unit: 'index_points',
            sourceUrl,
            retrievedAt,
            metadata: {
              placeName: parsed[headerIndex['place_name']],
              level: parsed[headerIndex['level']],
              indexSa: parsed[headerIndex['index_sa']] ? parseFloat(parsed[headerIndex['index_sa']]) : undefined,
            },
          });
        }
      }
    }

    // Sort chronologically (period: 'YYYY-QN')
    observations.sort((a, b) => a.period.localeCompare(b.period));

    return {
      countryCode: 'US',
      region: 'Miami',
      provider: this.id,
      series: 'All-Transactions House Price Index (NSA)',
      frequency: 'quarterly',
      observations,
    };
  }

  async getVerification(regionName: string): Promise<MarketVerificationResult> {
    const series = await this.fetchObservations(regionName);
    const count = series.observations.length;

    if (count === 0) {
      return {
        provider: this.id,
        region: regionName,
        officialSource: 'Federal Housing Finance Agency (FHFA HPI Master Dataset)',
        httpResult: 'HTTP 200 OK (0 observations matched)',
        latestPeriod: 'N/A',
        latestValue: 0,
        previousPeriod: 'N/A',
        previousValue: 0,
        calculatedChange: 0,
        observationCount: 0,
        status: 'FAIL',
        notes: 'No observations parsed for target region.',
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
      officialSource: 'Federal Housing Finance Agency (FHFA)',
      httpResult: 'HTTP 200 OK (text/csv stream)',
      latestPeriod: latest.period,
      latestValue: latest.value,
      previousPeriod: previous.period,
      previousValue: previous.value,
      calculatedChange: parseFloat(change.toFixed(2)),
      observationCount: count,
      status: count >= 10 ? 'PASS' : 'PARTIAL',
      notes: `Official MSA All-Transactions series for Miami-Miami Beach-Kendall, FL (MSAD: 33124).`,
    };
  }

  private parseCsvLine(line: string): string[] {
    const result: string[] = [];
    let cur = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') {
        inQuotes = !inQuotes;
      } else if (c === ',' && !inQuotes) {
        result.push(cur.trim());
        cur = '';
      } else {
        cur += c;
      }
    }
    result.push(cur.trim());
    return result;
  }
}
