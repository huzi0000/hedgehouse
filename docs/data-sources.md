# HedgeHouse Data Sources Specification (Phase 0: Feasibility Proof)

This document provides a technical and operational breakdown of the official public housing-market data sources investigated, integrated, and validated for HedgeHouse.

HedgeHouse requires deterministic resolution against official statistical indices. All providers documented below have been verified via live network probes and normalized into the unified HedgeHouse `HousingObservation` data model.

---

## 1. Miami, United States — Federal Housing Finance Agency (FHFA)

### Official Institution
- **Institution**: Federal Housing Finance Agency (FHFA), United States Federal Government
- **Domain**: `fhfa.gov`
- **Role**: Independent regulatory agency overseeing Fannie Mae, Freddie Mac, and the 11 Federal Home Loan Banks. Compiles the official repeat-sales House Price Index (FHFA HPI®) across the United States.

### Source URL & Access Method
- **Source URL**: `https://www.fhfa.gov/hpi/download/monthly/hpi_master.csv`
- **Catalog Page**: `https://www.fhfa.gov/data/hpi/datasets`
- **Access Method**: Direct HTTP GET streaming of consolidated Master CSV (UTF-8). No API key required.
- **Payload Size**: ~17.1 MB (containing over 130,000 historical rows across US states, divisions, and MSAs).

### Geographic Coverage & Identifier
- **Coverage**: All 50 states, 9 Census Divisions, and >400 Metropolitan Statistical Areas (MSAs).
- **Target Market**: Miami, Florida
- **Exact Geographic Identifier**:
  - `place_id`: `33124`
  - `place_name`: `"Miami-Miami Beach-Kendall, FL (MSAD)"` (Metropolitan Statistical Division)
  - `level`: `MSA`

### Exact Series Used
- **HPI Type**: `traditional`
- **HPI Flavor**: `all-transactions` (includes purchase and refinance appraisals)
- **Series Description**: `All-Transactions House Price Index (NSA)` (Non-Seasonally Adjusted)
- **Base Period**: 1995-Q1 = 100.0 (and 1975 base variants)
- **Unit**: Index points

### Update Frequency & Timeliness
- **Frequency**: Quarterly (releases at ~end of second month following quarter end, e.g., Q2 released late August).
- **Release Schedule**: Deterministic quarterly schedule published annually by FHFA.

### Known Limitations
1. **Consolidated File Size**: The dataset is provided as a single 17 MB master file. The HedgeHouse adapter handles this via Node.js streaming readline interface so memory consumption remains constant (~O(1) streaming).
2. **Revision Policy**: Like most repeat-sales indices, earlier quarter estimates may undergo minor retroactive revisions as subsequent mortgage transactions are recorded. Market rules should anchor to "first official publication" or specified snapshot block heights.

### Suitability for Deterministic Market Resolution
- **Rating**: **HIGH (Suitable)**
- **Rationale**: Highly authoritative federal agency data, unbroken quarterly history since 1975 (over 200 quarterly data points for Miami), transparent repeat-sales methodology, and machine-readable public access.

---

## 2. London, United Kingdom — HM Land Registry / ONS

### Official Institution
- **Institution**: HM Land Registry (HMLR), in partnership with the Office for National Statistics (ONS) and Land & Property Services Northern Ireland.
- **Domain**: `landregistry.data.gov.uk` / `gov.uk`
- **Role**: Government department that registers the ownership of land and property in England and Wales. Publishes the definitive monthly UK House Price Index (UK HPI).

### Source URL & Access Method
- **Source URL**: `http://landregistry.data.gov.uk/data/ukhpi/region/london.json?_pageSize=100&_view=all`
- **API Architecture**: W3C Linked Data API (RESTful JSON and SPARQL endpoint `https://landregistry.data.gov.uk/landregistry/query`).
- **Access Method**: Standard HTTP GET returning structured JSON (`application/json`). No authentication or API token required. Open Government Licence v3.0.

### Geographic Coverage & Identifier
- **Coverage**: Entire United Kingdom, constituent countries, English regions, counties, and local authority districts / London boroughs.
- **Target Market**: London (Greater London)
- **Exact Geographic Identifier**:
  - URI: `http://landregistry.data.gov.uk/id/region/london`
  - Slug: `london`
  - Label: `"London"`

### Exact Series Used
- **Series Name**: `UK House Price Index (All Dwellings)`
- **Index Field**: `housePriceIndex` (Base: January 2015 = 100.0)
- **Associated Metrics**:
  - `averagePrice`: Average geometric mean transaction price in GBP (£)
  - `percentageAnnualChange`: YoY percentage change
  - `percentageChange`: MoM percentage change
- **Unit**: Index points (and GBP £ for average price)

### Update Frequency & Timeliness
- **Frequency**: Monthly (typically released on the third or fourth Wednesday of the second month following the reference month, e.g., July data published mid-September).
- **Time Horizon**: Over 700 continuous monthly observations dating back to January 1968.

### Known Limitations
1. **Transaction Lag & Revisions**: HM Land Registry data relies on completed transaction lodgments. Registrations for the most recent month are preliminary and subject to minor adjustments in the subsequent 2–3 iterations.
2. **HTTP vs HTTPS**: The Linked Data frontend currently operates primarily over HTTP with redirection headers; the adapter handles redirects transparently.

### Suitability for Deterministic Market Resolution
- **Rating**: **VERY HIGH (Highly Suitable)**
- **Rationale**: The UK HPI REST API provides granular, structured JSON output with index numbers, average prices, and pre-calculated percentage changes. Predictable monthly release calendar.

---

## 3. Singapore — Urban Redevelopment Authority (URA) / SingStat

### Official Institution
- **Institution**: Urban Redevelopment Authority (URA) and Singapore Department of Statistics (SingStat), Government of Singapore.
- **Domain**: `ura.gov.sg` / `data.gov.sg`
- **Role**: National land use planning and statutory authority under the Ministry of National Development. Compiles the official Private Residential Property Price Index using caveats lodged with the Singapore Land Authority (SLA) and IRAS stamp duty data.

### Source URL & Access Method
- **Portal Source**: Data.gov.sg (Government open data repository)
- **API Base**: `https://api-open.data.gov.sg/v1/public/api/datasets/d_da00b36ca8c831322fa0bb2a3378a476/initiate-download`
- **Dataset ID**: `d_da00b36ca8c831322fa0bb2a3378a476`
- **Dataset Title**: *"Private Residential Property Price Index By Type Of Property (1st Quarter 2009 = 100), Quarterly"*
- **Access Method**: Two-step automated HTTP workflow:
  1. GET `initiate-download` endpoint on `api-open.data.gov.sg`
  2. Receive signed temporary AWS S3 object URL and download CSV stream
- **Authentication**: Free public tier available. Includes automatic retry backoff in the HedgeHouse adapter.

### Geographic Coverage & Identifier
- **Coverage**: Singapore nationwide, subdivided into Core Central Region (CCR), Rest of Central Region (RCR), and Outside Central Region (OCR).
- **Target Market**: Singapore (Nationwide Aggregate)
- **Exact Geographic Identifier**: `SG` / All Residential Properties

### Exact Series Used
- **Series Name**: `Private Residential Property Price Index (All Types)`
- **Row Identifier**: `Residential Properties` (also provides subseries: `Landed` and `Non-Landed`)
- **Base Period**: 2009-Q1 = 100.0
- **Unit**: Index points

### Update Frequency & Timeliness
- **Frequency**: Quarterly (Flash estimate released on 1st business day of month following quarter end; final comprehensive release on the 4th Friday of that month).
- **History**: Continuous quarterly data from 1975-Q1 to present (206 observations).

### Known Limitations
1. **S3 Pre-signed URL Workflow**: The data.gov.sg v2 API routes bulk table downloads through dynamic pre-signed AWS S3 URLs. Adapters must handle asynchronous download initiation and potential transient connection hiccups.
2. **Flash vs Final**: URA issues both "flash" and "final" figures. HedgeHouse prediction contracts must specify whether resolution resolves against flash estimates or final quarterly releases.

### Suitability for Deterministic Market Resolution
- **Rating**: **HIGH (Suitable)**
- **Rationale**: Official statutory data source, comprehensive legal caveat capture, unyielding quarterly cadence, and long time series.

---

## 4. Sydney, Australia — Australian Bureau of Statistics (ABS)

### Official Institution
- **Institution**: Australian Bureau of Statistics (ABS), Commonwealth Government of Australia.
- **Domain**: `abs.gov.au` / `data.api.abs.gov.au`
- **Role**: Australia's national statistical agency and official statutory authority for economic, demographic, and housing statistics.

### Source URL & Access Method
- **Official Release**: *Total Value of Dwellings* (ABS Catalogue **6432.0**)
- **Data Portal URL**: `https://www.abs.gov.au/statistics/economy/price-indexes-and-inflation/total-value-dwellings`
- **SDMX API Endpoint**: `https://data.api.abs.gov.au/rest/data/ABS,RES_DWELL,1.0.0/all?dimensionAtObservation=AllDimensions&lastNObservations=40`
- **Standard**: SDMX-JSON 1.0 (Statistical Data and Metadata Exchange)
- **Access Method**: Direct RESTful query returning SDMX JSON with dimensions, attributes, and time-series observations. No API key required for public SDMX endpoint.

### Critical Methodology Notice: Discontinued Index Preclusion
- **Explicit Instruction**: *"Use a currently maintained official housing statistic. Do NOT use a discontinued index as if it were current."*
- **Discontinued Series**: ABS Catalogue **6416.0** (*Residential Property Price Indexes: Eight Capital Cities*) ceased permanently with the **December quarter 2021** release.
- **Active Series Used**: ABS Catalogue **6432.0** (*Total Value of Dwellings*). First published in March 2022 to replace 6416.0, this series actively provides quarterly dwelling counts, mean values, and median transfer prices.

### Geographic Coverage & Identifier
- **Coverage**: Australia national, 8 States and Territories, and Greater Capital City Statistical Areas (GCCSA).
- **Target Market**: Sydney (Greater Sydney)
- **Exact Geographic Identifier**:
  - GCCSA Code: `1GSYD`
  - Name: `"Greater Sydney"` (within State `1` New South Wales)

### Exact Series Used
- **Dataflow Identifier**: `ABS:RES_DWELL(1.0.0)`
- **Measure**: `MEASURE=3` — *Median Price of Established House Transfers*
- **Alternative Measure**: `MEASURE=4` — *Median Price of Attached Dwelling Transfers*
- **Frequency**: `FREQ=Q` (Quarterly)
- **Raw Unit**: AUD Thousands (multiplied by 1,000 to normalize to standard AUD currency unit)
- **Normalized Unit**: `AUD`

### Update Frequency & Timeliness
- **Frequency**: Quarterly (released in the third month following the reference quarter, e.g. June quarter released in September).
- **Time Horizon**: Active uninterrupted series from 2021-Q4 through latest release (2026-Q2).

### Known Limitations
1. **SDMX Multi-dimensional Structure**: The ABS SDMX format encodes observations using multi-key coordinate strings (`measure:region:freq:time`). The adapter decodes the dimension descriptors dynamically to ensure robust parsing.
2. **Transaction Sample Thresholds**: Unlike pure hedonic repeat-sales models, 6432.0 reports unstratified medians and mean values from Valuer-General property transfers, which can experience quarterly compositional shifts.

### Suitability for Deterministic Market Resolution
- **Rating**: **HIGH (Suitable)**
- **Rationale**: Actively maintained, legal government dataset, eliminates risk of relying on dead 6416.0 endpoints, delivers machine-readable SDMX REST feeds, and provides unambiguous median house price figures in Australian dollars.
