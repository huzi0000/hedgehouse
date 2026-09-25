import React from 'react';
import { OFFICIAL_PROVIDERS } from '../../lib/housing/providers';
import { SchemaVisualizer } from '../../components/SchemaVisualizer';
import { getRegionVerification } from '../../lib/housing/cache';
import { 
  Database, 
  ExternalLink, 
  Layers, 
  CheckCircle2, 
  ArrowDown, 
  ShieldCheck,
  FileCheck2,
  Cpu
} from 'lucide-react';

export default function DataCredibilityPage() {
  const providerKeyMap: Record<string, string> = {
    FHFA: 'miami',
    UKHPI: 'london',
    URA: 'singapore',
    ABS: 'sydney',
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-14 font-mono">
      {/* Page Header */}
      <div className="max-w-3xl space-y-3">
        <div className="flex items-center space-x-2 text-xs text-[#10B981]">
          <Database className="w-3.5 h-3.5" />
          <span className="font-semibold uppercase tracking-wider">DATA CREDIBILITY &amp; METHODOLOGY</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold text-[#F4F4F0] leading-tight font-sans">
          Official data.<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#10B981] to-[#34D399]">
            Deterministic outcomes.
          </span>
        </h1>
        <p className="text-xs sm:text-sm text-[#8A918E] leading-relaxed font-sans">
          HedgeHouse does not rely on opaque third-party oracles, web-scraped real estate portals, or subjective crowd consensus. All protocol contracts resolve exclusively against official national statistical datasets.
        </p>
      </div>

      {/* Normalization Visualization Pipeline */}
      <div className="bg-[#121514] border border-[#222725] rounded-lg p-6 sm:p-8 space-y-6">
        <div>
          <span className="text-[10px] text-[#10B981] uppercase tracking-wider font-semibold block mb-1">
            ARCHITECTURE PIPELINE
          </span>
          <h3 className="text-lg sm:text-xl font-bold text-[#F4F4F0]">
            Deterministic Data Normalization Flow
          </h3>
          <p className="text-xs text-[#8A918E] mt-1 font-sans">
            How raw sovereign data transforms into cryptographic resolution
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-center">
          {/* Box 1 */}
          <div className="p-4 bg-[#161A18] border border-[#222725] rounded text-center space-y-1">
            <span className="text-[10px] text-[#565E5A] block uppercase font-bold">STAGE 01</span>
            <span className="text-xs font-bold text-[#F4F4F0] block">GOVERNMENT DATA</span>
            <span className="text-[10px] text-[#8A918E] block">FHFA, ONS, URA, ABS</span>
          </div>

          <div className="flex justify-center text-[#565E5A] md:rotate-0 rotate-90">
            <ArrowDown className="w-4 h-4 md:-rotate-90" />
          </div>

          {/* Box 2 */}
          <div className="p-4 bg-[#161A18] border border-[#10B981]/40 rounded text-center space-y-1">
            <span className="text-[10px] text-[#10B981] block uppercase font-bold">STAGE 02</span>
            <span className="text-xs font-bold text-[#10B981] block">HousingObservation</span>
            <span className="text-[10px] text-[#8A918E] block">Normalized Schema</span>
          </div>

          <div className="flex justify-center text-[#565E5A] md:rotate-0 rotate-90">
            <ArrowDown className="w-4 h-4 md:-rotate-90" />
          </div>

          {/* Box 3 */}
          <div className="p-4 bg-[#161A18] border border-[#222725] rounded text-center space-y-1">
            <span className="text-[10px] text-[#565E5A] block uppercase font-bold">STAGE 03</span>
            <span className="text-xs font-bold text-[#F4F4F0] block">DETERMINISTIC RESOLVER</span>
            <span className="text-[10px] text-[#8A918E] block">Mathematical Assertion</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center pt-2">
          {/* Box 4 */}
          <div className="p-4 bg-[#161A18] border border-[#222725] rounded text-center space-y-1">
            <span className="text-[10px] text-[#565E5A] block uppercase font-bold">STAGE 04</span>
            <span className="text-xs font-bold text-[#F4F4F0] block">HEDGEHOUSE MARKET</span>
            <span className="text-[10px] text-[#8A918E] block">Predefined Contract Rule</span>
          </div>

          <div className="flex justify-center text-[#565E5A] md:rotate-0 rotate-90">
            <ArrowDown className="w-4 h-4 md:-rotate-90" />
          </div>

          {/* Box 5 */}
          <div className="p-4 bg-[#161A18] border border-amber-400/40 rounded text-center space-y-1">
            <span className="text-[10px] text-amber-400 block uppercase font-bold">STAGE 05</span>
            <span className="text-xs font-bold text-amber-400 block">SOLANA PROTOCOL</span>
            <span className="text-[10px] text-[#8A918E] block">Awaiting Deployment</span>
          </div>
        </div>

        <div className="p-3 bg-[#0B0D0C] border border-[#222725] rounded text-xs text-[#8A918E] leading-relaxed font-sans">
          <strong>Deployment Notice:</strong> Data ingestion, schema normalization, and deterministic evaluation engines are fully operational in the codebase. The final on-chain market settlement layer activates upon Solana Mainnet protocol deployment.
        </div>
      </div>

      {/* Schema Transformer Interactive Inspector */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-bold text-[#F4F4F0]">
            Unified Schema Inspector
          </h3>
          <p className="text-xs text-[#8A918E] mt-0.5">
            Compare raw sovereign payloads against the normalized `HousingObservation` structure
          </p>
        </div>
        <SchemaVisualizer />
      </div>

      {/* 4 Sovereign Provider Modules */}
      <div className="space-y-6">
        <div className="border-b border-[#222725] pb-3">
          <h3 className="text-lg font-bold text-[#F4F4F0]">
            Sovereign Statistical Registries
          </h3>
          <p className="text-xs text-[#8A918E] mt-0.5">
            100% real observations fetched through the Phase 0 official provider layer
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {OFFICIAL_PROVIDERS.map((provider) => {
            const key = providerKeyMap[provider.id] || 'miami';
            const verif = getRegionVerification(key);

            const displayValue = verif
              ? key === 'sydney'
                ? `A$${verif.latestValue.toLocaleString()}`
                : `${verif.latestValue.toLocaleString()} pts`
              : provider.latestValue;

            const displayPeriod = verif?.latestPeriod || provider.latestPeriod;

            return (
              <div
                key={provider.id}
                className="bg-[#121514] border border-[#222725] rounded-lg p-6 space-y-4"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2 pb-3 border-b border-[#222725]">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-xs font-bold text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded border border-[#10B981]/20">
                        {provider.id}
                      </span>
                      <span className="text-xs text-[#8A918E] uppercase">{provider.country}</span>
                    </div>
                    <h4 className="text-base font-semibold text-[#F4F4F0]">{provider.name}</h4>
                  </div>
                  <div className="flex items-center space-x-1.5 text-[#10B981] text-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                    <span>ONLINE</span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-[#8A918E] leading-relaxed font-sans">
                  {provider.description}
                </p>

                {/* Metadata Grid */}
                <div className="bg-[#161A18] border border-[#222725] rounded p-3 text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-[#565E5A]">Institution:</span>
                    <span className="text-[#F4F4F0] text-right truncate max-w-[200px]">{provider.jurisdiction}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#565E5A]">Series Name:</span>
                    <span className="text-[#F4F4F0] text-right truncate max-w-[200px]">{provider.datasetName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#565E5A]">Frequency:</span>
                    <span className="text-[#F4F4F0] capitalize">{provider.frequency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#565E5A]">Publication Schedule:</span>
                    <span className="text-[#8A918E] text-right">{provider.publicationLag}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#565E5A]">Historical Coverage:</span>
                    <span className="text-[#F4F4F0] text-right">{provider.historicalDepth}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#565E5A]">Resolution Suitability:</span>
                    <span className="text-[#10B981] font-semibold">Predefined Legal Registry</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-[#222725]">
                    <span className="text-[#565E5A]">Latest Observation:</span>
                    <span className="text-[#10B981] font-semibold font-tabular">
                      {displayValue} ({displayPeriod})
                    </span>
                  </div>
                </div>

                {/* Direct Link to Official Data Source */}
                <div className="pt-1">
                  <a
                    href={provider.endpoint}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[#8A918E] hover:text-[#10B981] flex items-center justify-between transition-colors"
                  >
                    <span className="truncate pr-2">Official Agency Resource</span>
                    <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
