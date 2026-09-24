import type { IHousingDataProvider } from './base.ts';
import type { 
  HousingObservation, 
  HousingSeries, 
  MarketVerificationResult 
} from '../types/housing.ts';

export class URAProvider implements IHousingDataProvider {
  readonly id = 'URA';
  readonly name = 'Urban Redevelopment Authority / Singapore Dept of Statistics';
  readonly countryCode = 'SG';
  readonly supportedRegions = ['Singapore'];

  // Official dataset ID on data.gov.sg:
  // "Private Residential Property Price Index By Type Of Property (1st Quarter 2009 = 100), Quarterly"
  static readonly PRIMARY_DATASET_ID = 'd_da00b36ca8c831322fa0bb2a3378a476';
  static readonly INITIATE_DOWNLOAD_BASE = 'https://api-open.data.gov.sg/v1/public/api/datasets';

  async fetchObservations(regionName: string): Promise<HousingSeries> {
    if (regionName.toLowerCase() !== 'singapore') {
      throw new Error(`Unsupported region "${regionName}" for URA provider. Supported: ${this.supportedRegions.join(', ')}`);
    }

    const initiateUrl = `${URAProvider.INITIATE_DOWNLOAD_BASE}/${URAProvider.PRIMARY_DATASET_ID}/initiate-download`;
    
    // Use retry helper for resilience against transient network delays
    const initRes = await this.fetchWithRetry(initiateUrl, {
      headers: {
        'User-Agent': 'HedgeHouseDataFeasibility/1.0',
      },
    });

    if (!initRes.ok) {
      throw new Error(`data.gov.sg initiate-download failed: HTTP ${initRes.status} ${initRes.statusText}`);
    }

    const initJson = await initRes.json();
    const downloadUrl = initJson?.data?.url;
    if (!downloadUrl) {
      throw new Error(`data.gov.sg did not return download URL: ${JSON.stringify(initJson)}`);
    }

    const csvRes = await this.fetchWithRetry(downloadUrl);
    if (!csvRes.ok) {
      throw new Error(`CSV download failed from signed URL: HTTP ${csvRes.status}`);
    }

    const csvText = await csvRes.text();
    const lines = csvText.trim().split(/\r?\n/);
    if (lines.length < 2) {
      throw new Error('data.gov.sg returned empty CSV');
    }

    const header = lines[0].split(',').map(s => s.trim());
    const retrievedAt = new Date().toISOString();
    const observations: HousingObservation[] = [];

    // The dataset is structured as:
    // Header: DataSeries, 20262Q, 20261Q, 20254Q, ...
    // Row 1: "Residential Properties", 219.4, 218.3, 216.4, ...
    // Row 2: "   Landed", 258.4, ...
    // Row 3: "   Non-Landed", 210.6, ...
    for (let r = 1; r < lines.length; r++) {
      const row = lines[r].split(',').map(s => s.trim());
      const seriesName = row[0];
      if (seriesName === 'Residential Properties') {
        for (let col = 1; col < row.length && col < header.length; col++) {
          const rawQuarter = header[col]; // e.g. "20262Q"
          const valStr = row[col];
          const val = parseFloat(valStr);

          if (!isNaN(val) && rawQuarter) {
            // Normalize "20262Q" to "2026-Q2"
            const normPeriod = this.normalizeQuarter(rawQuarter);
            observations.push({
              countryCode: 'SG',
              region: 'Singapore',
              regionId: 'SG',
              provider: this.id,
              series: 'Private Residential Property Price Index (All Types)',
              period: normPeriod,
              frequency: 'quarterly',
              value: val,
              unit: 'index_points',
              sourceUrl: 'https://data.gov.sg/datasets/d_da00b36ca8c831322fa0bb2a3378a476',
              retrievedAt,
              metadata: {
                rawSeries: seriesName,
                rawQuarter,
                baseQuarter: '2009-Q1 = 100',
              },
            });
          }
        }
        break; // Found the aggregate residential properties series
      }
    }

    // Sort chronologically ascending
    observations.sort((a, b) => a.period.localeCompare(b.period));

    return {
      countryCode: 'SG',
      region: 'Singapore',
      provider: this.id,
      series: 'Private Residential Property Price Index (All Types)',
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
        officialSource: 'Urban Redevelopment Authority / SingStat via data.gov.sg',
        httpResult: 'HTTP 200 OK (0 items parsed)',
        latestPeriod: 'N/A',
        latestValue: 0,
        previousPeriod: 'N/A',
        previousValue: 0,
        calculatedChange: 0,
        observationCount: 0,
        status: 'FAIL',
        notes: 'Failed to extract Residential Properties series from URA dataset.',
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
      officialSource: 'Urban Redevelopment Authority (URA) / SingStat via data.gov.sg',
      httpResult: 'HTTP 200 OK (data.gov.sg Open API + S3 Stream)',
      latestPeriod: latest.period,
      latestValue: latest.value,
      previousPeriod: previous.period,
      previousValue: previous.value,
      calculatedChange: parseFloat(change.toFixed(2)),
      observationCount: count,
      status: count >= 10 ? 'PASS' : 'PARTIAL',
      notes: `Official URA Private Residential Property Price Index (Base: 2009-Q1 = 100).`,
    };
  }

  private normalizeQuarter(q: string): string {
    // "20262Q" -> "2026-Q2", "2026-Q2" -> "2026-Q2"
    const match = q.match(/^(\d{4})(\d)Q$/);
    if (match) {
      return `${match[1]}-Q${match[2]}`;
    }
    const match2 = q.match(/^(\d{4})\s*Q(\d)$/i);
    if (match2) {
      return `${match2[1]}-Q${match2[2]}`;
    }
    return q;
  }

  private async fetchWithRetry(url: string, init?: RequestInit, retries = 3, delayMs = 1500): Promise<Response> {
    let lastErr: any;
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const res = await fetch(url, init);
        if (res.ok) return res;
        if (attempt === retries) return res;
      } catch (err) {
        lastErr = err;
        if (attempt === retries) throw err;
      }
      await new Promise(r => setTimeout(r, delayMs * attempt));
    }
    throw lastErr;
  }
}
