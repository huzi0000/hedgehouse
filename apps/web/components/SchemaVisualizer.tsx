'use client';

import React, { useState } from 'react';
import { Code, CheckCircle, Database, Layers } from 'lucide-react';

interface NormalizedSample {
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
}

const SAMPLES: Record<string, { title: string; rawFormat: string; sample: NormalizedSample }> = {
  Miami: {
    title: 'Miami, USA (FHFA)',
    rawFormat: 'Raw 40MB Government Master CSV (MSAD 33124)',
    sample: {
      countryCode: 'US',
      region: 'Miami',
      regionId: '33124',
      provider: 'FHFA',
      series: 'All-Transactions House Price Index',
      period: '2026-Q2',
      frequency: 'quarterly',
      value: 666.21,
      unit: 'index_points',
      sourceUrl: 'https://www.fhfa.gov/DataTools/Downloads/Documents/HPI/HPI_master.csv',
      retrievedAt: '2026-09-25T11:15:22.000Z',
    },
  },
  London: {
    title: 'London, UK (UK HPI)',
    rawFormat: 'ONS Linked Data REST / SPARQL JSON',
    sample: {
      countryCode: 'GB',
      region: 'London',
      regionId: 'E12000007',
      provider: 'UKHPI',
      series: 'Average House Price Index',
      period: '2026-07',
      frequency: 'monthly',
      value: 96.4,
      unit: 'index_points',
      sourceUrl: 'https://landregistry.data.gov.uk/data/hpi/resources',
      retrievedAt: '2026-09-25T11:15:22.000Z',
    },
  },
  Singapore: {
    title: 'Singapore (URA)',
    rawFormat: 'data.gov.sg CKAN Datastore JSON API',
    sample: {
      countryCode: 'SG',
      region: 'Singapore',
      regionId: 'SG-ALL',
      provider: 'URA',
      series: 'Private Residential Property Price Index',
      period: '2026-Q2',
      frequency: 'quarterly',
      value: 219.4,
      unit: 'index_points',
      sourceUrl: 'https://data.gov.sg/api/action/datastore_search',
      retrievedAt: '2026-09-25T11:15:22.000Z',
    },
  },
  Sydney: {
    title: 'Sydney, Australia (ABS)',
    rawFormat: 'ABS SDMX 2.1 REST API',
    sample: {
      countryCode: 'AU',
      region: 'Sydney',
      regionId: '1GSYD',
      provider: 'ABS',
      series: 'Total Value of Dwellings (Cat 6432.0)',
      period: '2026-Q2',
      frequency: 'quarterly',
      value: 1487600,
      unit: 'AUD',
      sourceUrl: 'https://api.data.abs.gov.au/data/ABS,TOTAL_VALUE_DWELLINGS,1.0.0',
      retrievedAt: '2026-09-25T11:15:22.000Z',
    },
  },
};

export function SchemaVisualizer() {
  const [selectedKey, setSelectedKey] = useState<string>('Miami');
  const active = SAMPLES[selectedKey];

  return (
    <div className="w-full bg-[#121514] border border-[#222725] rounded-lg p-5 sm:p-6 font-mono">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#222725] gap-4 mb-5">
        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4 text-[#10B981]" />
          <div>
            <h4 className="text-xs font-semibold text-[#F4F4F0] uppercase tracking-wider">
              Normalized Schema Transformer
            </h4>
            <span className="text-[11px] text-[#8A918E]">
              Canonical `HousingObservation` Interface
            </span>
          </div>
        </div>

        {/* City Selectors */}
        <div className="flex flex-wrap gap-1.5">
          {Object.keys(SAMPLES).map((key) => (
            <button
              key={key}
              onClick={() => setSelectedKey(key)}
              className={`px-3 py-1 text-xs rounded transition-colors ${
                selectedKey === key
                  ? 'bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 font-semibold'
                  : 'bg-[#161A18] text-[#8A918E] hover:text-[#F4F4F0] border border-[#222725]'
              }`}
            >
              {key}
            </button>
          ))}
        </div>
      </div>

      {/* Raw vs Normalized Pipeline Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-xs">
        <div className="p-3 bg-[#161A18] border border-[#222725] rounded">
          <span className="text-[10px] text-[#565E5A] block uppercase">Source Feed Format</span>
          <span className="text-[#F4F4F0] font-medium">{active.rawFormat}</span>
        </div>
        <div className="p-3 bg-[#161A18] border border-[#222725] rounded">
          <span className="text-[10px] text-[#565E5A] block uppercase">Standardized Output</span>
          <div className="flex items-center space-x-1.5 text-[#10B981] font-medium">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Schema Compliant (TypeScript interface)</span>
          </div>
        </div>
      </div>

      {/* Code Inspector */}
      <div className="relative bg-[#0B0D0C] border border-[#222725] rounded-md p-4 overflow-x-auto text-[11px] sm:text-xs text-[#F4F4F0] leading-relaxed">
        <pre className="font-mono">
          <code>{JSON.stringify(active.sample, null, 2)}</code>
        </pre>
      </div>

      <div className="mt-4 pt-3 border-t border-[#1D2220] flex items-center justify-between text-[11px] text-[#565E5A]">
        <span>Phase 0 Validation: Complete in `src/providers/`</span>
        <span>Deterministic Determinism: 100%</span>
      </div>
    </div>
  );
}
