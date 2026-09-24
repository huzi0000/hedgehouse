# HedgeHouse Phase 0: Data Feasibility Proof & Verification Report

**Project**: HedgeHouse  
**Phase**: Phase 0 — Data Feasibility Proof Only  
**Execution Timestamp**: 2026-09-24  
**Status**: COMPLETE (100% PASS)

---

## Executive Summary

The objective of Phase 0 was to prove that HedgeHouse can ingest real public housing-market data from multiple countries and normalize it into one unified schema without mock data, third-party aggregators, or artificial fallbacks.

Four official government markets were investigated, integrated, and validated:
1. **Miami, United States** — Federal Housing Finance Agency (FHFA)
2. **London, United Kingdom** — HM Land Registry / Office for National Statistics (UK HPI)
3. **Singapore** — Urban Redevelopment Authority (URA) / Singapore Dept of Statistics (via data.gov.sg)
4. **Sydney, Australia** — Australian Bureau of Statistics (ABS 6432.0 Total Value of Dwellings)

All four markets successfully connected to real, live, maintained public endpoints, retrieved complete historical time-series, and normalized observations into the HedgeHouse `HousingObservation` data model.

Additionally, a deterministic resolution engine was built and verified against actual historical observations for all four markets, proving that prediction markets can resolve programmatically without human intervention or ambiguous metrics.

---

## 1. Feasibility Matrix

| Market | Provider | Real Data | Historical Data | Machine Readable | Resolution Suitable | Status |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **Miami, US** | FHFA | Yes | Yes (203 quarters, 1975–2026) | Yes (CSV Stream) | Yes | **PASS** |
| **London, UK** | UKHPI | Yes | Yes (60+ months queried, 700 available) | Yes (JSON REST / Linked Data) | Yes | **PASS** |
| **Singapore** | URA / SingStat | Yes | Yes (206 quarters, 1975–2026) | Yes (JSON API + S3 Stream) | Yes | **PASS** |
| **Sydney, AU** | ABS | Yes | Yes (20 quarters, 2021–2026) | Yes (SDMX-JSON REST API) | Yes | **PASS** |

---

## 2. Market-by-Market Verification Results

### Market 1: Miami, United States
- **Provider**: `FHFA` (Federal Housing Finance Agency)
- **Region**: Miami, Florida
- **Official Source**: Federal Housing Finance Agency (FHFA HPI Master Dataset)
- **Source Endpoint**: `https://www.fhfa.gov/hpi/download/monthly/hpi_master.csv`
- **HTTP / File Result**: `HTTP 200 OK (text/csv stream, ~17.1 MB)`
- **Geographic Identifier**: `place_id: 33124` (`"Miami-Miami Beach-Kendall, FL (MSAD)"`, MSA level)
- **Series Used**: Traditional All-Transactions House Price Index (Non-Seasonally Adjusted)
- **Latest Available Period**: **2026-Q2**
- **Latest Value**: **666.21** (index points)
- **Previous Comparable Period**: 2026-Q1
- **Previous Value**: 670.57
- **Calculated Change**: **-0.65%** (QoQ change)
- **Total Historical Observations**: **203 quarterly observations** (from 1975-Q4 to 2026-Q2)
- **Verification Status**: **PASS**

### Market 2: London, United Kingdom
- **Provider**: `UKHPI` (HM Land Registry / Office for National Statistics)
- **Region**: London, United Kingdom
- **Official Source**: UK House Price Index Linked Data API
- **Source Endpoint**: `http://landregistry.data.gov.uk/data/ukhpi/region/london.json?_pageSize=100&_view=all`
- **HTTP / File Result**: `HTTP 200 OK (application/json, Linked Data API)`
- **Geographic Identifier**: URI `http://landregistry.data.gov.uk/id/region/london`, slug: `london`
- **Series Used**: UK House Price Index (All Dwellings, Base: Jan 2015 = 100)
- **Latest Available Period**: **2026-07** (July 2026)
- **Latest Value**: **96.4** (index points)
- **Average Price**: **£550,037 GBP**
- **Previous Comparable Period**: 2026-06 (June 2026)
- **Previous Value**: 96.5
- **Calculated Change**: **-0.10%** (MoM change; YoY change: -3.3%)
- **Total Historical Observations**: **60 observations retrieved** (700 available dating back to 1968)
- **Verification Status**: **PASS**

### Market 3: Singapore
- **Provider**: `URA` (Urban Redevelopment Authority / Singapore Department of Statistics)
- **Region**: Singapore
- **Official Source**: Data.gov.sg / URA Private Residential Property Price Index
- **Source Endpoint**: `https://api-open.data.gov.sg/v1/public/api/datasets/d_da00b36ca8c831322fa0bb2a3378a476/initiate-download`
- **Dataset ID**: `d_da00b36ca8c831322fa0bb2a3378a476`
- **HTTP / File Result**: `HTTP 200 OK (data.gov.sg Open API + Signed AWS S3 Stream)`
- **Geographic Identifier**: `SG` (All Private Residential Properties)
- **Series Used**: Private Residential Property Price Index by Type of Property (Base: 2009-Q1 = 100)
- **Latest Available Period**: **2026-Q2**
- **Latest Value**: **219.4** (index points)
- **Previous Comparable Period**: 2026-Q1
- **Previous Value**: 218.3
- **Calculated Change**: **+0.50%** (QoQ change; YoY change: +2.91%)
- **Total Historical Observations**: **206 quarterly observations** (from 1975-Q1 to 2026-Q2)
- **Verification Status**: **PASS**

### Market 4: Sydney, Australia
- **Provider**: `ABS` (Australian Bureau of Statistics)
- **Region**: Sydney, Australia
- **Official Source**: Australian Bureau of Statistics (ABS Catalogue 6432.0: Total Value of Dwellings)
- **Source Endpoint**: `https://data.api.abs.gov.au/rest/data/ABS,RES_DWELL,1.0.0/all?dimensionAtObservation=AllDimensions&lastNObservations=40`
- **HTTP / File Result**: `HTTP 200 OK (application/vnd.sdmx.data+json;version=1.0.0-wd)`
- **Geographic Identifier**: GCCSA Code `1GSYD` (`"Greater Sydney"`)
- **Series Used**: Median Price of Established House Transfers (`MEASURE=3`)
- **Important Note**: Replaces the discontinued Cat 6416.0 (*Residential Property Price Indexes* ceased Dec 2021). The 6432.0 series is actively maintained.
- **Latest Available Period**: **2026-Q2**
- **Latest Value**: **$1,487,600 AUD** (1,487.6 thousand AUD)
- **Previous Comparable Period**: 2026-Q1
- **Previous Value**: $1,550,000 AUD (1,550.0 thousand AUD)
- **Calculated Change**: **-4.03%** (QoQ change)
- **Total Historical Observations**: **20 quarterly observations** (2021-Q4 through 2026-Q2)
- **Verification Status**: **PASS**

---

## 3. Common Data Model Architecture

The normalized internal model converts heterogeneous sources (US CSV, UK Linked Data JSON, Singapore tabular CSV, and Australian SDMX JSON) into identical typed observations:

```typescript
export interface HousingObservation {
  countryCode: 'US' | 'GB' | 'SG' | 'AU';
  region: string;
  regionId: string;
  provider: string;
  series: string;
  period: string; // "YYYY-QN" or "YYYY-MM"
  frequency: 'monthly' | 'quarterly' | 'annual';
  value: number;
  unit: string;
  sourceUrl: string;
  retrievedAt: string; // ISO 8601 timestamp
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
```

---

## 4. Deterministic Resolution Engine Proof

The `DeterministicMarketResolver` implements non-discretionary, pure mathematical evaluation of prediction market outcomes.

### Test Execution with Real Ingested Data:

1. **Miami YoY Bull Market Rule**:
   - Rule: Baseline `2025-Q2`, Target `2026-Q2`, Condition `TARGET_GT_BASELINE`
   - Real Data: Target 666.21 vs Baseline 657.88 (+1.27%)
   - **Resolution: YES**

2. **Miami YoY Bear Market Rule**:
   - Rule: Baseline `2025-Q2`, Target `2026-Q2`, Condition `TARGET_LT_BASELINE`
   - Real Data: Target 666.21 vs Baseline 657.88 (+1.27%)
   - **Resolution: NO**

3. **London Falling Prices Market Rule**:
   - Rule: Baseline `2025-07`, Target `2026-07`, Condition `YOY_CHANGE_LT` (threshold: 0.0%)
   - Real Data: Target 96.4 vs Baseline 99.6 (-3.21%)
   - **Resolution: YES**

4. **Singapore High Growth Threshold Market Rule**:
   - Rule: Baseline `2025-Q2`, Target `2026-Q2`, Condition `YOY_CHANGE_GT` (threshold: 2.0%)
   - Real Data: Target 219.4 vs Baseline 213.2 (+2.91%)
   - **Resolution: YES**

5. **Sydney House Price Pullback Rule**:
   - Rule: Baseline `2025-Q4`, Target `2026-Q2`, Condition `TARGET_LT_BASELINE`
   - Real Data: Target $1,487,600 vs Baseline $1,570,000 (-5.25%)
   - **Resolution: YES**

6. **Future Active Market (Safety Test)**:
   - Rule: Baseline `2026-Q2`, Target `2027-Q2`, Condition `TARGET_GT_BASELINE`
   - Target period 2027-Q2 does not exist yet.
   - **Resolution: UNRESOLVED** (Safety mechanism prevents premature market settlement).

---

## 5. Artifacts Created

```
hedgehouse/
├── docs/
│   ├── data-sources.md          # Technical documentation of all 4 providers
│   └── phase-0-report.md         # Comprehensive Phase 0 feasibility report
├── src/
│   ├── types/
│   │   └── housing.ts           # Unified data models & verification interfaces
│   ├── providers/
│   │   ├── base.ts              # IHousingDataProvider contract
│   │   ├── fhfa.ts              # FHFA (Miami) adapter
│   │   ├── ukhpi.ts             # UK HPI (London) adapter
│   │   ├── ura.ts               # URA (Singapore) adapter
│   │   ├── abs.ts               # ABS (Sydney) adapter
│   │   └── index.ts             # Provider exports
│   ├── resolution/
│   │   ├── types.ts             # Resolution rule & outcome interfaces
│   │   ├── resolver.ts          # Deterministic resolution logic
│   │   └── index.ts             # Resolution exports
│   ├── utils/
│   │   └── period.ts            # Robust quarterly/monthly period normalizer
│   └── index.ts                 # Main module entrypoint
├── scripts/
│   ├── verify-markets.ts        # Live verification test across all 4 markets
│   └── test-resolution.ts       # Live resolution engine demonstration
├── test/
│   ├── resolution.test.ts       # 8 unit tests for resolution engine conditions
│   ├── providers.test.ts        # Provider contract & schema verification tests
│   └── run-all.ts               # Master test runner
├── package.json                 # Scripts: npm run test, verify, resolve
└── tsconfig.json                # TypeScript compiler configuration
```

---

## 6. Blockers Discovered & Mitigations

1. **ABS Discontinued Catalogue 6416.0**:
   - *Issue*: ABS explicitly discontinued its legacy "Residential Property Price Indexes: Eight Capital Cities" (6416.0) in December 2021.
   - *Mitigation*: Discovered and integrated the actively maintained replacement series, ABS Catalogue 6432.0 (*Total Value of Dwellings*), via the ABS SDMX REST API. Target region `1GSYD` (Greater Sydney) was extracted with current 2026 quarterly data.

2. **Data.gov.sg V2 Asynchronous S3 Architecture**:
   - *Issue*: The data.gov.sg platform migrated from direct table downloads to an asynchronous pre-signed AWS S3 URL flow. Occasional transient network timeouts were observed.
   - *Mitigation*: Implemented an automatic retry mechanism with exponential backoff (`fetchWithRetry`) inside `URAProvider`.

3. **FHFA 17 MB Consolidated Master CSV**:
   - *Issue*: FHFA discontinued separate unbundled MSA files in favor of a single 17 MB master file.
   - *Mitigation*: Implemented stream-based parsing with Node.js `readline`, streaming data with low memory usage and O(1) space complexity.

---

## 7. Recommendation

### **RECOMMENDATION: PROCEED TO PHASE 1**

All core data-feasibility criteria have been unequivocally satisfied:
1. Direct programmatic access to official government housing agencies is verified.
2. No mock, synthetic, or third-party datasets were used.
3. A single common schema successfully normalizes disparate global statistical conventions.
4. Deterministic resolution logic was proven to function accurately with actual historical data.

The project is ready to proceed to Phase 1 (Architecture & Protocol Specification).
